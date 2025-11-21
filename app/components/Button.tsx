"use client"
import Link from "next/link"
import styled from "styled-components"

// Types //

interface ButtonProps {
	variant?: "primary" | "secondary"
	size?: "small" | "default"
	href?: string
	children: React.ReactNode
	className?: string
	target?: string
	rel?: string
	type?: "button" | "submit" | "reset"
	disabled?: boolean
	onClick?: () => void
}

// Components //

export const Button = ({
	variant = "primary",
	size = "small",
	href,
	children,
	className,
	target,
	rel,
	type,
	disabled,
	onClick
}: ButtonProps) => {
	const commonProps = {
		className,
		disabled,
		onClick,
		$variant: variant,
		$size: size
	}

	if (href) {
		const isExternal = href.startsWith("http://") || href.startsWith("https://")
		const isTelLink = href.startsWith("tel:")
		if (isExternal || isTelLink) {
			return (
				<StyledExternalLink
					href={href}
					target={isTelLink ? target : target || "_blank"}
					rel={isTelLink ? rel : rel || "noopener noreferrer"}
					{...commonProps}
				>
					{children}
				</StyledExternalLink>
			)
		}
		return (
			<StyledLink href={href} {...commonProps}>
				{children}
			</StyledLink>
		)
	}

	return (
		<StyledButton type={type || "button"} {...commonProps}>
			{children}
		</StyledButton>
	)
}

// Styled Components //

const StyledButton = styled.button<{
	$variant: "primary" | "secondary"
	$size: "small" | "default"
}>`
	padding: ${(props) => (props.$size === "small" ? "0.5rem 1rem" : "0.75rem 1.5rem")};
	border-radius: 0.25rem;
	font-weight: ${(props) => (props.$size === "small" ? "500" : "600")};
	font-size: ${(props) => (props.$size === "small" ? "inherit" : "1.1rem")};
	cursor: pointer;
	transition: all 0.2s ease;
	text-decoration: none;
	display: inline-block;
	border: none;
	font-family: inherit;
	line-height: 1.5;
	background-color: ${(props) => (props.$variant === "primary" ? "white" : "transparent")};
	color: ${(props) => (props.$variant === "primary" ? "black" : "white")};
	border: ${(props) => (props.$variant === "secondary" ? "1px solid white" : "none")};

	&:hover:not(:disabled) {
		background-color: ${(props) =>
			props.$variant === "primary" ? "#ddd" : "rgba(255, 255, 255, 0.1)"};
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`

const StyledLink = styled(Link)<{ $variant: "primary" | "secondary"; $size: "small" | "default" }>`
	padding: ${(props) => (props.$size === "small" ? "0.5rem 1rem" : "0.75rem 1.5rem")};
	border-radius: 0.25rem;
	font-weight: ${(props) => (props.$size === "small" ? "500" : "600")};
	font-size: ${(props) => (props.$size === "small" ? "inherit" : "1.1rem")};
	cursor: pointer;
	transition: all 0.2s ease;
	text-decoration: none;
	display: inline-block;
	border: none;
	font-family: inherit;
	line-height: 1.5;
	background-color: ${(props) => (props.$variant === "primary" ? "white" : "transparent")};
	color: ${(props) => (props.$variant === "primary" ? "black" : "white")};
	border: ${(props) => (props.$variant === "secondary" ? "1px solid white" : "none")};

	&:hover {
		background-color: ${(props) =>
			props.$variant === "primary" ? "#ddd" : "rgba(255, 255, 255, 0.1)"};
	}
`

const StyledExternalLink = styled.a<{
	$variant: "primary" | "secondary"
	$size: "small" | "default"
}>`
	padding: ${(props) => (props.$size === "small" ? "0.5rem 1rem" : "0.75rem 1.5rem")};
	border-radius: 0.25rem;
	font-weight: ${(props) => (props.$size === "small" ? "500" : "600")};
	font-size: ${(props) => (props.$size === "small" ? "inherit" : "1.1rem")};
	cursor: pointer;
	transition: all 0.2s ease;
	text-decoration: none;
	display: inline-block;
	border: none;
	font-family: inherit;
	line-height: 1.5;
	background-color: ${(props) => (props.$variant === "primary" ? "white" : "transparent")};
	color: ${(props) => (props.$variant === "primary" ? "black" : "white")};
	border: ${(props) => (props.$variant === "secondary" ? "1px solid white" : "none")};

	&:hover {
		background-color: ${(props) =>
			props.$variant === "primary" ? "#ddd" : "rgba(255, 255, 255, 0.1)"};
	}
`
