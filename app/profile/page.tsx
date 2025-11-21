"use client"
import styled from "styled-components"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "../../lib/supabaseClient"
import { PotionBackground } from "../components/PotionBackground"
import { Button } from "../components/Button"
import { TextInput } from "../components/TextInput"

type ProfileData = {
	memberId: number
	fullName: string
	email: string
	title: string
	affiliation: string
	profilePhoto: string
}

export default function Profile() {
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [profile, setProfile] = useState<ProfileData | null>(null)
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
	const router = useRouter()

	useEffect(() => {
		const loadProfile = async () => {
			if (!supabaseClient) return

			const {
				data: { user }
			} = await supabaseClient.auth.getUser()

			if (!user) {
				router.push("/login")
				return
			}

			// Fetch member and profile data
			// relying on email linking since we don't have UUID in member table yet
			const { data: memberData, error: memberError } = await supabaseClient
				.from("member")
				.select(
					`
					id,
					full_name,
					email,
					member_profile (
						title,
						affiliation,
						profile_photo
					)
				`
				)
				.eq("email", user.email)
				.single()

			if (memberError || !memberData) {
				console.error("Error fetching profile:", memberError)
				setLoading(false)
				return
			}

			const profileData = memberData.member_profile as any

			setProfile({
				memberId: memberData.id,
				fullName: memberData.full_name,
				email: memberData.email,
				title: profileData?.title || "",
				affiliation: profileData?.affiliation || "",
				profilePhoto: profileData?.profile_photo || user.user_metadata.avatar_url || ""
			})
			setLoading(false)
		}

		loadProfile()
	}, [router])

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!profile || !supabaseClient) return

		setSaving(true)
		setMessage(null)

		try {
			// Update member_profile
			const { error } = await supabaseClient
				.from("member_profile")
				.update({
					title: profile.title,
					affiliation: profile.affiliation,
					profile_photo: profile.profilePhoto
				})
				.eq("member_id", profile.memberId)

			if (error) throw error

			// Also update full name in member table if changed
			const { error: memberError } = await supabaseClient
				.from("member")
				.update({ full_name: profile.fullName })
				.eq("id", profile.memberId)

			if (memberError) throw memberError

			setMessage({ type: "success", text: "Profile updated successfully!" })
		} catch (err: any) {
			setMessage({ type: "error", text: err.message || "Failed to update profile" })
		} finally {
			setSaving(false)
		}
	}

	const handleSignOut = async () => {
		await supabaseClient?.auth.signOut()
		router.push("/")
	}

	if (loading) {
		return (
			<>
				<BackgroundContainer>
					<PotionBackground />
				</BackgroundContainer>
				<Container>
					<LoadingText>Loading profile...</LoadingText>
				</Container>
			</>
		)
	}

	return (
		<>
			<BackgroundContainer>
				<PotionBackground />
			</BackgroundContainer>
			<Container>
				<ProfileCard>
					<HeaderRow>
						<Title>Your Profile</Title>
						<Button onClick={handleSignOut} variant="secondary" size="small">
							Sign Out
						</Button>
					</HeaderRow>

					{message && <Message $type={message.type}>{message.text}</Message>}

					<Form onSubmit={handleSave}>
						<AvatarContainer>
							{profile?.profilePhoto && <Avatar src={profile.profilePhoto} alt="Profile" />}
						</AvatarContainer>

						<InputGroup>
							<Label>Full Name</Label>
							<TextInput
								value={profile?.fullName || ""}
								onChange={(e) =>
									setProfile((prev) => (prev ? { ...prev, fullName: e.target.value } : null))
								}
								placeholder="Your Full Name"
							/>
						</InputGroup>

						<InputGroup>
							<Label>Email</Label>
							<TextInput value={profile?.email || ""} disabled style={{ opacity: 0.7 }} />
						</InputGroup>

						<InputGroup>
							<Label>Title</Label>
							<TextInput
								value={profile?.title || ""}
								onChange={(e) =>
									setProfile((prev) => (prev ? { ...prev, title: e.target.value } : null))
								}
								placeholder="e.g. Senior Software Engineer"
							/>
						</InputGroup>

						<InputGroup>
							<Label>Affiliation</Label>
							<TextInput
								value={profile?.affiliation || ""}
								onChange={(e) =>
									setProfile((prev) => (prev ? { ...prev, affiliation: e.target.value } : null))
								}
								placeholder="e.g. Company Name, University, or Freelance"
							/>
						</InputGroup>

						<ButtonContainer>
							<Button type="submit" disabled={saving} variant="primary" size="default">
								{saving ? "Saving..." : "Save Profile"}
							</Button>
						</ButtonContainer>
					</Form>
				</ProfileCard>
			</Container>
		</>
	)
}

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
	padding: 6rem 1rem 2rem;
`

const LoadingText = styled.div`
	color: white;
	font-size: 1.2rem;
`

const ProfileCard = styled.div`
	background-color: rgba(0, 0, 0, 0.75);
	backdrop-filter: blur(8px);
	padding: 3rem;
	border-radius: 1rem;
	width: 100%;
	max-width: 600px;
	display: flex;
	flex-direction: column;
	gap: 2rem;
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
`

const HeaderRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`

const Title = styled.h1`
	font-size: 2rem;
	font-weight: 700;
	color: white;
	margin: 0;
`

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
`

const InputGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`

const Label = styled.label`
	color: rgba(255, 255, 255, 0.9);
	font-size: 0.9rem;
	font-weight: 500;
`

const ButtonContainer = styled.div`
	margin-top: 1rem;
	display: flex;
	justify-content: flex-end;
`

const Message = styled.div<{ $type: "success" | "error" }>`
	padding: 1rem;
	border-radius: 0.5rem;
	background-color: ${(props) =>
		props.$type === "success" ? "rgba(75, 181, 67, 0.2)" : "rgba(255, 107, 107, 0.2)"};
	color: ${(props) => (props.$type === "success" ? "#4bb543" : "#ff6b6b")};
	border: 1px solid ${(props) => (props.$type === "success" ? "#4bb543" : "#ff6b6b")};
`

const AvatarContainer = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: 1rem;
`

const Avatar = styled.img`
	width: 100px;
	height: 100px;
	border-radius: 50%;
	object-fit: cover;
	border: 3px solid rgba(255, 255, 255, 0.2);
`
