"use client"
import styled from "styled-components"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabaseClient } from "../../lib/supabaseClient"

// Components //

export const GiveATalkCTA: React.FC = () => {
	const router = useRouter()
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

	useEffect(() => {
		const checkAuth = async () => {
			const {
				data: { user }
			} = await supabaseClient.auth.getUser()
			setIsAuthenticated(!!user)
		}
		checkAuth()
	}, [])

	const handleClick = (e: React.MouseEvent) => {
		if (isAuthenticated === false) {
			e.preventDefault()
			const redirectUrl = encodeURIComponent("/submit-talk")
			router.push(`/login?redirect=${redirectUrl}`)
		}
	}

	return (
		<StyledLink href="/submit-talk" onClick={handleClick}>
			<IconWrapper>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={2}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
					/>
				</svg>
			</IconWrapper>
			<span>Give a Talk!</span>
		</StyledLink>
	)
}

const StyledLink = styled(Link)`
	display: inline-flex;
	align-items: center;
	padding: 0.5rem 1rem;
	gap: 0.5rem;
	font-weight: 500;
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.95);
	text-decoration: none;
	transition: all 0.3s ease-in-out;
	border-radius: 15px 0 20px 0px;
	box-shadow:
		0 0 20px rgba(156, 163, 255, 0.15),
		0 0 40px rgba(92, 107, 246, 0.1),
		0 0 60px rgba(28, 28, 40, 0.4),
		0 1px 3px rgba(0, 0, 0, 0.9),
		0 10px 20px -5px rgba(28, 28, 40, 0.5),
		inset 0 1px 0 rgba(156, 163, 255, 0.1);
	background: linear-gradient(
		135deg,
		rgba(28, 28, 40, 0.9) 0%,
		rgba(15, 15, 22, 0.95) 25%,
		rgba(0, 0, 1, 1) 50%,
		rgba(15, 15, 22, 0.95) 75%,
		rgba(28, 28, 40, 0.9) 100%
	);
	border: 1px solid rgba(156, 163, 255, 0.5);
	position: relative;
	overflow: hidden;
	white-space: nowrap;
	transform: perspective(1000px) rotateX(5deg) skew(-10deg) scaleY(.9);
	animation: pulseGlow 3s ease-in-out infinite;

	&::before {
		content: "";
		position: absolute;
		top: -200%;
		left: -100%;
		width: 300%;
		height: 400%;
		background: linear-gradient(
			115deg,
			transparent 40%,
			rgba(156, 163, 255, 0.15) 48%,
			rgba(255, 255, 255, 0.25) 50%,
			rgba(156, 163, 255, 0.15) 52%,
			transparent 60%
		);
		animation: shimmer 2.5s linear infinite;
	}

	&::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.4) 50%,
			transparent 100%
		);
		pointer-events: none;
	}

	&:hover {
		transform: perspective(1000px) rotateX(5deg) translateY(-1px) skew(-10deg) scaleY(.9);
		box-shadow:
			0 0 30px rgba(156, 163, 255, 0.25),
			0 0 50px rgba(92, 107, 246, 0.15),
			0 0 80px rgba(28, 28, 40, 0.5),
			0 2px 4px rgba(0, 0, 0, 1),
			0 15px 30px -5px rgba(28, 28, 40, 0.7),
			inset 0 1px 0 rgba(156, 163, 255, 0.15);
		text-decoration: none;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%) translateY(-100%) rotate(45deg);
		}
		100% {
			transform: translateX(100%) translateY(100%) rotate(45deg);
		}
	}

	@keyframes pulseGlow {
		0%, 100% {
			box-shadow:
				0 0 20px rgba(156, 163, 255, 0.15),
				0 0 40px rgba(92, 107, 246, 0.1),
				0 0 60px rgba(28, 28, 40, 0.4),
				0 1px 3px rgba(0, 0, 0, 0.9),
				0 10px 20px -5px rgba(28, 28, 40, 0.5),
				inset 0 1px 0 rgba(156, 163, 255, 0.1);
		}
		50% {
			box-shadow:
				0 0 35px rgba(156, 163, 255, 0.25),
				0 0 70px rgba(92, 107, 246, 0.18),
				0 0 100px rgba(28, 28, 40, 0.5),
				0 1px 3px rgba(0, 0, 0, 0.9),
				0 10px 20px -5px rgba(28, 28, 40, 0.5),
				inset 0 1px 0 rgba(156, 163, 255, 0.15);
		}
	}

		&:hover {
			transform: scale(1.02) skew(-10deg) scaleY(.9);
			box-shadow:
				0 4px 12px rgba(0, 0, 0, 1),
				0 0 20px rgba(92, 107, 246, 0.1),
				inset 0 1px 0 rgba(255, 255, 255, 0.2);
			text-decoration: none;
		}

		@keyframes shimmer {
			0% {
				transform: translateX(-100%) translateY(-100%) rotate(45deg);
			}
			100% {
				transform: translateX(100%) translateY(100%) rotate(45deg);
			}
		}

		&::after {
			content: "";
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 50%;
			background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
			pointer-events: none;
		}

		&:hover {
			transform: scale(1.03) skew(-10deg) scaleY(.9);
			box-shadow:
				0 6px 16px rgba(0, 0, 0, 0.8),
				0 0 20px rgba(92, 107, 246, 0.15),
				inset 0 1px 0 rgba(255, 255, 255, 0.25),
				inset 0 -1px 0 rgba(0, 0, 0, 0.9);
			text-decoration: none;
		}

		@keyframes shimmer {
			0% {
				transform: translateX(-100%) translateY(-100%) rotate(45deg);
			}
			100% {
				transform: translateX(100%) translateY(100%) rotate(45deg);
			}
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.8;
		}
	}
`

const IconWrapper = styled.div`
	width: 1.25rem;
	height: 1.25rem;
	display: flex;
	align-items: center;
	justify-content: center;

	svg {
		width: 100%;
		height: 100%;
	}
`
