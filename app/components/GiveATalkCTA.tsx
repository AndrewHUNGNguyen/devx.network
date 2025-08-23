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
	display: inline-flex;
	align-items: center;
	padding: 0.5rem 1rem;
	gap: 0.5rem;
	font-weight: 600;
	font-size: 0.875rem;
	color: white;
	text-decoration: none;
	transition: all 0.3s ease-in-out;
	border-radius: 9999px;
	box-shadow:
		0 4px 6px -1px rgba(0, 0, 0, 0.1),
		0 2px 4px -1px rgba(0, 0, 0, 0.06);
	background: linear-gradient(to right, #8b5cf6, #7c3aed);
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	white-space: nowrap;

	&:hover {
		background: linear-gradient(to right, #7c3aed, #6d28d9);
		transform: scale(1.05);
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
		text-decoration: none;
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
