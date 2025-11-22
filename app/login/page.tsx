"use client"
import styled from "styled-components"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "../../lib/supabaseClient"
import { updateProfileCache } from "../../lib/profileCache"
import { PotionBackground } from "../components/PotionBackground"
import { Button } from "../components/Button"
import { PageContainer } from "../components/PageContainer"

export default function Login() {
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	useEffect(() => {
		// Handle OAuth callback and check for existing session
		const checkAuth = async () => {
			// Get redirect URL from query params or localStorage (stored before OAuth)
			const searchParams = new URLSearchParams(window.location.search)
			let redirectUrl = searchParams.get("redirect")

			// If no redirect in URL, check localStorage (might have been stored before OAuth)
			if (!redirectUrl && typeof window !== "undefined") {
				redirectUrl = localStorage.getItem("auth_redirect") || null
				if (redirectUrl) {
					localStorage.removeItem("auth_redirect")
				}
			}

			// Check for OAuth callback in URL hash
			const hashParams = new URLSearchParams(window.location.hash.substring(1))
			if (hashParams.get("access_token") || hashParams.get("error")) {
				// OAuth callback detected - Supabase will handle it automatically
				// Wait a moment for session to be restored
				await new Promise((resolve) => setTimeout(resolve, 500))
			}

			// Check for existing session
			const {
				data: { session }
			} = await supabaseClient.auth.getSession()

			if (session?.user) {
				// Get handle and profile photo, cache in metadata, then redirect
				const { data: profile } = await supabaseClient
					.from("profiles")
					.select("handle, profile_photo")
					.eq("user_id", session.user.id)
					.single()

				if (profile) {
					// Cache profile info in user metadata
					await updateProfileCache(profile.handle || null, profile.profile_photo || null)

					// If redirect URL is provided, use it (user has profile, so they can go to redirect)
					// Otherwise, redirect to setup if no handle, or to profile if handle exists
					if (redirectUrl) {
						router.push(decodeURIComponent(redirectUrl))
					} else if (profile.handle) {
						router.push(`/whois?${profile.handle}`)
					} else {
						// No handle - redirect to setup
						router.push("/setup")
					}
				} else {
					// No profile - redirect to setup with redirect URL
					const setupUrl = redirectUrl
						? `/setup?redirect=${encodeURIComponent(redirectUrl)}`
						: "/setup"
					router.push(setupUrl)
				}
			}
		}
		checkAuth()
	}, [router])

	const handleLogin = async (provider: "google" | "github") => {
		try {
			// Get redirect URL from query params to preserve it through OAuth flow
			const searchParams = new URLSearchParams(window.location.search)
			const redirectUrl = searchParams.get("redirect")

			// Store redirect URL in localStorage before OAuth (in case query params get lost)
			if (redirectUrl && typeof window !== "undefined") {
				localStorage.setItem("auth_redirect", redirectUrl)
			}

			// Include redirect in the OAuth callback URL
			const loginUrl = redirectUrl
				? `${window.location.origin}/login?redirect=${encodeURIComponent(redirectUrl)}`
				: `${window.location.origin}/login`

			const { error } = await supabaseClient!.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: loginUrl
				}
			})
			if (error) throw error
		} catch (err: any) {
			setError(err.message)
		}
	}

	return (
		<>
			<BackgroundContainer>
				<PotionBackground />
			</BackgroundContainer>
			<Container>
				<PageContainer alignItems="center">
					<Title>Sign In</Title>
					<Subtitle>Join the DEVx community</Subtitle>

					{error && <ErrorMessage>{error}</ErrorMessage>}

					<ButtonContainer>
						<Button onClick={() => handleLogin("google")} size="default" variant="primary">
							Continue with Google
						</Button>

						<Button onClick={() => handleLogin("github")} size="default" variant="secondary">
							Continue with GitHub
						</Button>
					</ButtonContainer>
				</PageContainer>
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
	padding: 1rem;
`

const Title = styled.h1`
	font-size: 2rem;
	font-weight: 700;
	color: white;
	margin: 0;
`

const Subtitle = styled.p`
	color: rgba(255, 255, 255, 0.7);
	margin: -1rem 0 0 0;
	text-align: center;
`

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 100%;

	button {
		width: 100%;
		justify-content: center;
	}
`

const ErrorMessage = styled.div`
	color: #ff6b6b;
	background-color: rgba(255, 107, 107, 0.1);
	padding: 0.75rem;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	text-align: center;
	width: 100%;
`
