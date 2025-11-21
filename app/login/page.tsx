"use client"
import styled from "styled-components"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "../../lib/supabaseClient"
import { PotionBackground } from "../components/PotionBackground"
import { Button } from "../components/Button"

export default function Login() {
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	useEffect(() => {
		// Redirect if already logged in
		const checkUser = async () => {
			const { data } = (await supabaseClient?.auth.getUser()) || {}
			if (data?.user) {
				router.push("/profile")
			}
		}
		checkUser()
	}, [router])

	const handleLogin = async (provider: "google" | "github") => {
		try {
			const { error } = await supabaseClient!.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: `${window.location.origin}/profile`
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
				<LoginCard>
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
				</LoginCard>
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

const LoginCard = styled.div`
	background-color: rgba(0, 0, 0, 0.75);
	backdrop-filter: blur(8px);
	padding: 3rem;
	border-radius: 1rem;
	width: 100%;
	max-width: 400px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rem;
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
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
