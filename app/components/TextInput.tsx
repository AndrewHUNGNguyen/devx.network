"use client"
import styled from "styled-components"

// Types //

type BaseInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">

interface TextInputProps extends BaseInputProps {
	variant?: "primary" | "secondary"
	size?: "small" | "default"
}

// Components //

export const TextInput = ({ variant = "secondary", size = "small", ...props }: TextInputProps) => {
	return <StyledInput $variant={variant} $size={size} {...props} />
}

// Styled Components //

const StyledInput = styled.input<{ $variant: "primary" | "secondary"; $size: "small" | "default" }>`
	padding: ${(props) => (props.$size === "small" ? "0.5rem 1rem" : "0.75rem 1.5rem")};
	border-radius: 0.25rem;
	font-weight: ${(props) => (props.$size === "small" ? "500" : "600")};
	font-size: ${(props) => (props.$size === "small" ? "inherit" : "1.1rem")};
	font-family: inherit;
	line-height: 1.5;
	transition: all 0.2s ease;
	width: 100%;
	box-sizing: border-box;
	background-color: ${(props) => (props.$variant === "primary" ? "white" : "transparent")};
	color: ${(props) => (props.$variant === "primary" ? "black" : "white")};
	border: ${(props) =>
		props.$variant === "secondary"
			? "1px solid rgba(255, 255, 255, 0.3)"
			: "1px solid rgba(0, 0, 0, 0.2)"};

	&:focus {
		outline: none;
		border-color: ${(props) => (props.$variant === "secondary" ? "white" : "rgba(0, 0, 0, 0.4)")};
		background-color: ${(props) =>
			props.$variant === "primary" ? "white" : "rgba(255, 255, 255, 0.05)"};
	}

	&::placeholder {
		color: ${(props) =>
			props.$variant === "primary" ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)"};
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`
