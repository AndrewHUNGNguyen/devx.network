"use client"
import styled from "styled-components"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "../../lib/supabaseClient"
import { updateProfileCache } from "../../lib/profileCache"
import { PotionBackground } from "../components/PotionBackground"
import { Nametag } from "../components/Nametag"
import { TextInput } from "../components/TextInput"
import { Button } from "../components/Button"

type NametagData = {
	fullName: string
	title: string
	affiliation: string
	profilePhoto: string
}

export default function Setup() {
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [handle, setHandle] = useState("")
	const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null)
	const [checkingHandle, setCheckingHandle] = useState(false)
	const [nametagData, setNametagData] = useState<NametagData>({
		fullName: "",
		title: "",
		affiliation: "",
		profilePhoto: ""
	})
	const router = useRouter()

	useEffect(() => {
		const checkAuth = async () => {
			// Clean up OAuth callback tokens from URL
			if (typeof window !== "undefined") {
				const hashParams = new URLSearchParams(window.location.hash.substring(1))
				if (hashParams.get("access_token") || hashParams.get("error")) {
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

			// Check if profile already exists
			const { data: existingProfile } = await supabaseClient
				.from("profiles")
				.select("id")
				.eq("user_id", user.id)
				.single()

			if (existingProfile) {
				// Get handle and redirect to handle-based URL
				const { data: profileWithHandle } = await supabaseClient
					.from("profiles")
					.select("handle")
					.eq("user_id", user.id)
					.single()

				if (profileWithHandle?.handle) {
					router.push(`/whois?${profileWithHandle.handle}`)
				} else {
					// User has profile but no handle - stay on setup to create handle
					setLoading(false)
				}
				return
			}

			// Pre-populate nametag data from OAuth metadata
			setNametagData({
				fullName:
					user.user_metadata?.full_name ||
					user.user_metadata?.name ||
					user.user_metadata?.display_name ||
					user.email?.split("@")[0] ||
					"",
				title: "",
				affiliation: "",
				profilePhoto: ""
			})

			setLoading(false)
		}

		checkAuth()
	}, [router])

	// Check handle availability
	useEffect(() => {
		const checkAvailability = async () => {
			if (!handle.trim()) {
				setHandleAvailable(null)
				return
			}

			// Validate handle format: lowercase alphanumeric with underscores/hyphens, 3-30 chars
			const handleRegex = /^[a-z0-9_-]+$/
			if (!handleRegex.test(handle) || handle.length < 3 || handle.length > 30) {
				setHandleAvailable(false)
				return
			}

			setCheckingHandle(true)

			try {
				const { data, error } = await supabaseClient!
					.from("profiles")
					.select("handle")
					.eq("handle", handle.toLowerCase())
					.single()

				if (error && error.code === "PGRST116") {
					// No profile found with this handle - available
					setHandleAvailable(true)
				} else if (data) {
					// Handle already exists
					setHandleAvailable(false)
				} else {
					setHandleAvailable(false)
				}
			} catch (err) {
				console.error("Error checking handle availability:", err)
				setHandleAvailable(false)
			} finally {
				setCheckingHandle(false)
			}
		}

		const timeoutId = setTimeout(checkAvailability, 500) // Debounce
		return () => clearTimeout(timeoutId)
	}, [handle])

	const handleImageUpload = async (file: File): Promise<string> => {
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

	const handleFinishSetup = async (e: React.FormEvent) => {
		e.preventDefault()

		// Validate form
		if (!handle.trim() || !handleAvailable) {
			return
		}

		if (!nametagData.profilePhoto || !nametagData.fullName.trim()) {
			return
		}

		setSaving(true)

		try {
			const {
				data: { user }
			} = await supabaseClient.auth.getUser()

			if (!user) throw new Error("User not authenticated")

			const handleValue = handle.toLowerCase().trim()
			const { data: newProfile, error } = await supabaseClient
				.from("profiles")
				.insert({
					user_id: user.id,
					email: user.email,
					handle: handleValue,
					full_name: nametagData.fullName,
					profile_photo: nametagData.profilePhoto,
					title: nametagData.title || null,
					affiliation: nametagData.affiliation || null
				})
				.select()
				.single()

			if (error) throw error

			// Cache profile info in user metadata
			await updateProfileCache(handleValue, nametagData.profilePhoto)

			// Redirect to handle-based profile page
			router.push(`/whois?${handleValue}`)
		} catch (err: any) {
			console.error("Failed to create profile:", err)
			// TODO: Show error message to user
		} finally {
			setSaving(false)
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

	return (
		<>
			<BackgroundContainer>
				<PotionBackground />
			</BackgroundContainer>
			<Container>
				<ContentWrapper>
					<HeaderRow>
						<Title>Welcome to DEVx</Title>
					</HeaderRow>

					<Form onSubmit={handleFinishSetup}>
						<Section>
							<SectionTitle>Choose a handle</SectionTitle>
							<HandleInputWrapper>
								<TextInput
									variant="secondary"
									size="default"
									value={handle}
									onChange={(e) => setHandle(e.target.value.toLowerCase())}
									placeholder="your-handle"
									required
									pattern="[a-z0-9_-]+"
									minLength={3}
									maxLength={30}
								/>
								{handle && (
									<HandleStatus>
										{checkingHandle ? (
											<StatusText $color="rgba(255, 255, 255, 0.5)">Checking...</StatusText>
										) : handleAvailable === true ? (
											<StatusText $color="#4ade80">✓ Available</StatusText>
										) : handleAvailable === false ? (
											<StatusText $color="#f87171">✗ Unavailable</StatusText>
										) : null}
									</HandleStatus>
								)}
							</HandleInputWrapper>
							<HelpText>
								3-30 characters, lowercase letters, numbers, underscores, and hyphens only
							</HelpText>
						</Section>

						<Section>
							<SectionTitle>Get your nametag</SectionTitle>
							<Nametag
								data={nametagData}
								onSave={async () => {}}
								onImageUpload={handleImageUpload}
								uploading={uploading}
								forcedEditMode={true}
								onDataChange={setNametagData}
							/>
						</Section>

						<ButtonWrapper>
							<Button
								type="submit"
								variant="primary"
								size="default"
								disabled={
									saving ||
									uploading ||
									!handle.trim() ||
									!handleAvailable ||
									!nametagData.profilePhoto ||
									!nametagData.fullName.trim()
								}
							>
								{saving ? "Creating Profile..." : "Finish Setup"}
							</Button>
						</ButtonWrapper>
					</Form>
				</ContentWrapper>
			</Container>
		</>
	)
}

// Styled Components

const BackgroundContainer = styled.section`
	position: fixed;
	inset: 0;
	z-index: -1;
`

const Container = styled.main`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	padding: 2rem;
	position: relative;
	z-index: 0;
`

const ContentWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2rem;
	width: 100%;
	max-width: 700px;
	align-items: center;
`

const HeaderRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	margin-bottom: 1rem;
`

const Title = styled.h1`
	font-size: 2.5rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.95);
	text-align: center;
	width: 100%;
`

const LoadingText = styled.p`
	color: rgba(255, 255, 255, 0.7);
	font-size: 1.2rem;
`

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 2rem;
	width: 100%;
`

const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 100%;
`

const SectionTitle = styled.h2`
	font-size: 1.5rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.95);
	margin: 0;
`

const HandleInputWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	width: 100%;
`

const HandleStatus = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
`

const StatusText = styled.span<{ $color: string }>`
	color: ${(props) => props.$color};
	font-size: 0.875rem;
	font-weight: 500;
`

const HelpText = styled.p`
	color: rgba(255, 255, 255, 0.6);
	font-size: 0.875rem;
	margin: 0;
`

const ButtonWrapper = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
`
