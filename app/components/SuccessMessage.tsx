"use client"
import styled from "styled-components"

// Types //

interface SuccessMessageProps {
	title: string
	message: string
	className?: string
}

// Components //

export const SuccessMessage = ({ title, message, className }: SuccessMessageProps) => {
	return (
		<StyledContainer className={className}>
			<SuccessIcon>✓</SuccessIcon>
			<SuccessText>
				<strong>{title}</strong>
				<br />
				{message}
			</SuccessText>
		</StyledContainer>
	)
}

// Styled Components //

const StyledContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
	background-color: rgba(34, 197, 94, 0.1);
	border: 1px solid rgba(34, 197, 94, 0.3);
	padding: 1rem;
	border-radius: 0.5rem;
	color: #22c55e;
`

const SuccessIcon = styled.div`
	width: 2rem;
	height: 2rem;
	border-radius: 50%;
	background-color: rgba(34, 197, 94, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.25rem;
	font-weight: bold;
	flex-shrink: 0;
`

const SuccessText = styled.div`
	flex: 1;
	font-size: 0.9375rem;
	line-height: 1.5;

	strong {
		font-weight: 600;
		display: block;
		margin-bottom: 0.25rem;
	}
`
