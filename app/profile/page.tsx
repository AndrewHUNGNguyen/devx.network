"use client"
import styled from "styled-components"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "../../lib/supabaseClient"
import { PotionBackground } from "../components/PotionBackground"
import { Nametag } from "../components/Nametag"
import { TagCloudSection } from "../components/TagCloudSection"

type ProfileData = {
	id: number
	fullName: string
	email: string
	title: string
	affiliation: string
	profilePhoto: string
	interests: Tag[]
	skills: Tag[]
}

type Tag = {
	id: number
	name: string
	approved: boolean
}

type NametagData = {
	fullName: string
	title: string
	affiliation: string
	profilePhoto: string
}

export default function Profile() {
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [profileId, setProfileId] = useState<number | null>(null)
	const [profile, setProfile] = useState<ProfileData | null>(null)
	const [email, setEmail] = useState("")
	const router = useRouter()

	useEffect(() => {
		const loadProfile = async () => {
			if (!supabaseClient) return

			// Clean up OAuth callback tokens from URL
			if (typeof window !== "undefined") {
				const hashParams = new URLSearchParams(window.location.hash.substring(1))
				if (hashParams.get("access_token") || hashParams.get("error")) {
					// Remove the hash from URL after Supabase processes it
					window.history.replaceState(null, "", window.location.pathname + window.location.search)
				}
			}

			const {
				data: { user }
			} = await supabaseClient.auth.getUser()

			if (!user) {
				router.push("/login")
				return
			}

			setEmail(user.email || "")

			const { data: profileData, error: profileError } = await supabaseClient
				.from("profiles")
				.select("*")
				.eq("user_id", user.id)
				.single()

			if (profileError && profileError.code !== "PGRST116") {
				console.error("Error fetching profile:", profileError)
			}

			if (profileData) {
				setProfileId(profileData.id)

				// Load interests
				const { data: interestsData } = await supabaseClient
					.from("profile_interests")
					.select(
						`
						interest_id,
						interests (
							id,
							name,
							approved
						)
					`
					)
					.eq("profile_id", profileData.id)

				const interests: Tag[] =
					interestsData?.map((item: any) => ({
						id: item.interests.id,
						name: item.interests.name,
						approved: item.interests.approved
					})) || []

				// Load skills
				const { data: skillsData } = await supabaseClient
					.from("profile_skills")
					.select(
						`
						skill_id,
						skills (
							id,
							name,
							approved
						)
					`
					)
					.eq("profile_id", profileData.id)

				const skills: Tag[] =
					skillsData?.map((item: any) => ({
						id: item.skills.id,
						name: item.skills.name,
						approved: item.skills.approved
					})) || []

				setProfile({
					id: profileData.id,
					fullName: profileData.full_name,
					email: profileData.email,
					title: profileData.title || "",
					affiliation: profileData.affiliation || "",
					profilePhoto: profileData.profile_photo || "",
					interests,
					skills
				})
			} else {
				// No profile exists - redirect to setup
				router.push("/setup")
				return
			}
			setLoading(false)
		}

		loadProfile()
	}, [router])

	const handleImageUpload = async (file: File): Promise<string> => {
		if (!supabaseClient) throw new Error("Supabase client not initialized")

		setUploading(true)

		try {
			const fileExt = file.name.split(".").pop()
			const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
			const filePath = `${fileName}`

			const { error: uploadError } = await supabaseClient.storage
				.from("avatars")
				.upload(filePath, file)

			if (uploadError) throw uploadError

			const {
				data: { publicUrl }
			} = supabaseClient.storage.from("avatars").getPublicUrl(filePath)

			return publicUrl
		} catch (error: any) {
			console.error("Error uploading image:", error)
			throw error
		} finally {
			setUploading(false)
		}
	}

	const saveTags = async (tags: Tag[], tableName: "interests" | "skills", profileId: number) => {
		if (!supabaseClient) return

		const junctionTable = tableName === "interests" ? "profile_interests" : "profile_skills"
		const foreignKey = tableName === "interests" ? "interest_id" : "skill_id"

		// Delete existing links
		await supabaseClient.from(junctionTable).delete().eq("profile_id", profileId)

		if (tags.length === 0) return

		// Get or create tags and collect their IDs
		const tagIds: number[] = []

		for (const tag of tags) {
			let tagId = tag.id

			// If tag has a temporary ID (negative or very large), it's new - create it
			if (tag.id > 1000000000 || tag.id < 0) {
				// Check if tag already exists by name
				const { data: existing } = await supabaseClient
					.from(tableName)
					.select("id")
					.eq("name", tag.name)
					.single()

				if (existing) {
					tagId = existing.id
				} else {
					// Create new tag (not approved)
					const { data: newTag, error } = await supabaseClient
						.from(tableName)
						.insert({ name: tag.name, approved: false })
						.select("id")
						.single()

					if (error) throw error
					tagId = newTag.id
				}
			}

			tagIds.push(tagId)
		}

		// Create links
		if (tagIds.length > 0) {
			const links = tagIds.map((tagId) => ({
				profile_id: profileId,
				[foreignKey]: tagId
			}))

			const { error } = await supabaseClient.from(junctionTable).insert(links)
			if (error) throw error
		}
	}

	const handleSave = async (data: NametagData) => {
		if (!supabaseClient) return

		if (!data.profilePhoto) {
			return
		}

		setSaving(true)

		try {
			const {
				data: { user }
			} = await supabaseClient.auth.getUser()

			if (!user) throw new Error("User not authenticated")

			const profileDataToSave = {
				user_id: user.id,
				email: email,
				full_name: data.fullName,
				profile_photo: data.profilePhoto,
				title: data.title,
				affiliation: data.affiliation
			}

			let currentProfileId = profileId

			if (profileId) {
				const { error } = await supabaseClient
					.from("profiles")
					.update(profileDataToSave)
					.eq("id", profileId)
				if (error) throw error
			} else {
				const { data: newProfile, error } = await supabaseClient
					.from("profiles")
					.insert(profileDataToSave)
					.select()
					.single()
				if (error) throw error
				if (newProfile) {
					currentProfileId = newProfile.id
					setProfileId(newProfile.id)
				}
			}

			// Reload profile
			if (currentProfileId) {
				const { data: profileData } = await supabaseClient
					.from("profiles")
					.select("*")
					.eq("id", currentProfileId)
					.single()

				if (profileData) {
					// Reload interests and skills
					const { data: interestsData } = await supabaseClient
						.from("profile_interests")
						.select(
							`
							interest_id,
							interests (
								id,
								name,
								approved
							)
						`
						)
						.eq("profile_id", currentProfileId)

					const interests: Tag[] =
						interestsData?.map((item: any) => ({
							id: item.interests.id,
							name: item.interests.name,
							approved: item.interests.approved
						})) || []

					const { data: skillsData } = await supabaseClient
						.from("profile_skills")
						.select(
							`
							skill_id,
							skills (
								id,
								name,
								approved
							)
						`
						)
						.eq("profile_id", currentProfileId)

					const skills: Tag[] =
						skillsData?.map((item: any) => ({
							id: item.skills.id,
							name: item.skills.name,
							approved: item.skills.approved
						})) || []

					setProfile({
						id: profileData.id,
						fullName: profileData.full_name,
						email: profileData.email,
						title: profileData.title || "",
						affiliation: profileData.affiliation || "",
						profilePhoto: profileData.profile_photo || "",
						interests,
						skills
					})
				}
			}
		} catch (err: any) {
			throw err
		} finally {
			setSaving(false)
		}
	}

	const handleSaveInterests = async (tags: Tag[]) => {
		if (!profileId || !supabaseClient) return

		await saveTags(tags, "interests", profileId)

		// Reload interests
		const { data: interestsData } = await supabaseClient
			.from("profile_interests")
			.select(
				`
				interest_id,
				interests (
					id,
					name,
					approved
				)
			`
			)
			.eq("profile_id", profileId)

		const interests: Tag[] =
			interestsData?.map((item: any) => ({
				id: item.interests.id,
				name: item.interests.name,
				approved: item.interests.approved
			})) || []

		if (profile) {
			setProfile({ ...profile, interests })
		}
	}

	const handleSaveSkills = async (tags: Tag[]) => {
		if (!profileId || !supabaseClient) return

		await saveTags(tags, "skills", profileId)

		// Reload skills
		const { data: skillsData } = await supabaseClient
			.from("profile_skills")
			.select(
				`
				skill_id,
				skills (
					id,
					name,
					approved
				)
			`
			)
			.eq("profile_id", profileId)

		const skills: Tag[] =
			skillsData?.map((item: any) => ({
				id: item.skills.id,
				name: item.skills.name,
				approved: item.skills.approved
			})) || []

		if (profile) {
			setProfile({ ...profile, skills })
		}
	}

	if (loading) {
		return (
			<>
				<BackgroundContainer>
					<PotionBackground />
				</BackgroundContainer>
				<Container>
					<LoadingText>Loading...</LoadingText>
				</Container>
			</>
		)
	}

	if (!profile) {
		return null
	}

	const nametagData: NametagData = {
		fullName: profile.fullName,
		title: profile.title,
		affiliation: profile.affiliation,
		profilePhoto: profile.profilePhoto
	}

	return (
		<>
			<BackgroundContainer>
				<PotionBackground />
			</BackgroundContainer>
			<Container>
				<ContentWrapper>
					{!profileId && (
						<>
							<HeaderRow>
								<Title>Welcome to DEVx</Title>
							</HeaderRow>
							<InstructionText>Get your nametag</InstructionText>
						</>
					)}

					<Nametag
						data={nametagData}
						onSave={handleSave}
						onImageUpload={handleImageUpload}
						uploading={uploading}
						saving={saving}
						initialEditing={!profileId}
					/>

					{profileId && (
						<>
							<TagCloudSection
								title="Interests"
								selectedTags={profile.interests || []}
								onTagsChange={handleSaveInterests}
								tableName="interests"
								profileId={profileId}
							/>
							<TagCloudSection
								title="Skills"
								selectedTags={profile.skills || []}
								onTagsChange={handleSaveSkills}
								tableName="skills"
								profileId={profileId}
							/>
						</>
					)}
				</ContentWrapper>
			</Container>
		</>
	)
}

// Styled Components

const BackgroundContainer = styled.section`
	background-color: #0a0a0a;
	position: fixed;
	height: 100vh;
	width: 100vw;
	top: 0;
	left: 0;
	z-index: -1;
`

const Container = styled.main`
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 2rem;
`

const ContentWrapper = styled.div`
	width: 100%;
	max-width: 700px;
	display: flex;
	flex-direction: column;
	gap: 2rem;
`

const LoadingText = styled.div`
	color: white;
	font-size: 1.2rem;
`

const HeaderRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
`

const Title = styled.h1`
	font-size: 2.5rem;
	font-weight: 700;
	color: white;
	margin: 0;
`

const InstructionText = styled.p`
	color: rgba(255, 255, 255, 0.9);
	font-size: 1.25rem;
	margin: -1rem 0 1rem 0;
`
