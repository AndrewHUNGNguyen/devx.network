"use client"
import { links } from "../siteConfig"
import styled from "styled-components"

export const GiveATalkCTA: React.FC = () => {
	return (
		<StyledLink href={links.talkSubmissionUrl} target="_blank" rel="noopener noreferrer">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="w-6 h-6"
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
			<span>Give a Talk!</span>
		</StyledLink>
	)
}

const StyledLink = styled.a`
	position: fixed;
	display: flex;
	align-items: center;
	padding-left: 1.5rem; /* px-6 */
	padding-right: 1.5rem; /* px-6 */
	padding-top: 0.75rem; /* py-3 */
	padding-bottom: 0.75rem; /* py-3 */
	gap: 0.5rem; /* space-x-2 */
	font-weight: 700; /* font-bold */
	color: white; /* text-white */
	transition: all 0.3s ease-in-out; /* transition-all duration-300 ease-in-out */
	transform: translateX(-50%); /* -translate-x-1/2 */
	border-radius: 9999px; /* rounded-full */
	box-shadow:
		0 10px 15px -3px rgba(0, 0, 0, 0.1),
		0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
	background: linear-gradient(
		to right,
		#8b5cf6,
		#7c3aed
	); /* bg-gradient-to-r from-purple-500 to-purple-600 */
	bottom: 6rem; /* bottom-12 */
	left: 50%; /* left-1/2 */
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; /* animate-pulse */

	&:hover {
		background: linear-gradient(
			to right,
			#7c3aed,
			#6d28d9
		); /* hover:from-purple-600 hover:to-purple-700 */
		transform: translateX(-50%) scale(1.05); /* hover:scale-105 */
	}

	svg {
		width: 1.5rem; /* w-6 */
		height: 1.5rem; /* h-6 */
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
