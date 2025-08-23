"use client"
import styled from "styled-components"
import { links } from "../siteConfig"

// Components //

export const GiveATalkCTA: React.FC = () => {
	return (
		<StyledLink href={links.talkSubmissionUrl} target="_blank" rel="noopener noreferrer">
			<IconWrapper>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
					/>
				</svg>
			</IconWrapper>
			<span>Give a Talk!</span>
		</StyledLink>
	)
}

const StyledLink = styled.a`
	position: absolute;
	display: flex;
	align-items: center;
	padding: 0.75rem 1.5rem;
	gap: 0.5rem;
	font-weight: 700;
	color: white;
	transition: all 0.3s ease-in-out;
	transform: translateX(-50%);
	border-radius: 9999px;
	box-shadow:
		0 10px 15px -3px rgba(0, 0, 0, 0.1),
		0 4px 6px -2px rgba(0, 0, 0, 0.05);
	background: linear-gradient(to right, #8b5cf6, #7c3aed);
	bottom: 3rem;
	left: 50%;
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	z-index: 50;

	&:hover {
		background: linear-gradient(to right, #7c3aed, #6d28d9);
		transform: translateX(-50%) scale(1.05);
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
	width: 1.5rem;
	height: 1.5rem;

	svg {
		width: 100%;
		height: 100%;
	}
`
