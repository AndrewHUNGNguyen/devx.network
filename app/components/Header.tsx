"use client"
import { useState, useEffect } from "react"
import styled from "styled-components"
import { links } from "../siteConfig"
import { GiveATalkCTA } from "./GiveATalkCTA"
import { Button } from "./Button"

// Components //

export const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen)
	}

	const closeMenu = () => {
		setIsMenuOpen(false)
	}

	// Prevent body scroll when sidebar is open
	useEffect(() => {
		if (isMenuOpen) {
			document.body.style.overflow = "hidden"
		} else {
			document.body.style.overflow = "unset"
		}

		return () => {
			document.body.style.overflow = "unset"
		}
	}, [isMenuOpen])

	// Close sidebar when resizing to desktop
	useEffect(() => {
		// Use matchMedia to detect the same breakpoint as CSS
		const mediaQuery = window.matchMedia("(min-width: 768px)")

		const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
			// If we're at desktop size and menu is open, close it
			if (e.matches && isMenuOpen) {
				setIsMenuOpen(false)
			}
		}

		// Check on mount
		handleMediaChange(mediaQuery)

		// Listen for changes
		mediaQuery.addEventListener("change", handleMediaChange)

		return () => {
			mediaQuery.removeEventListener("change", handleMediaChange)
		}
	}, [isMenuOpen])

	return (
		<>
			<Container>
				<Nav>
					<NavStart>
						<MenuButton onClick={toggleMenu}>
							<MenuIcon
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h8m-8 6h16"
								/>
							</MenuIcon>
						</MenuButton>
					</NavStart>
					<NavCenter>
						<MenuList>
							<NavLinks />
						</MenuList>
					</NavCenter>
					<NavEnd>
						<Button href={links.discord}>Join Us on Discord</Button>
					</NavEnd>
				</Nav>
			</Container>

			{/* Mobile Sidebar */}
			<SidebarOverlay $isOpen={isMenuOpen} onClick={closeMenu} />
			<MobileSidebar $isOpen={isMenuOpen}>
				<SidebarHeader>
					<CloseButton onClick={closeMenu}>
						<CloseIcon
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</CloseIcon>
					</CloseButton>
				</SidebarHeader>
				<SidebarContent>
					<NavLinks />
				</SidebarContent>
			</MobileSidebar>
		</>
	)
}

const NavLinks = () => {
	return (
		<>
			<MenuItem>
				<MenuLink href="/">Home</MenuLink>
			</MenuItem>
			<MenuItem>
				<MenuLink target="_blank" href={links.lumaUrl}>
					Event Calendar
				</MenuLink>
			</MenuItem>
			<MenuItem>
				<MenuLink href="/watch">Watch</MenuLink>
			</MenuItem>
			{/* Hide Events until the page design is ready and finalized */}
			{/* <MenuItem>
				<MenuLink href="/events">Events</MenuLink>
			</MenuItem> */}
			<CTAMenuItem>
				<GiveATalkCTA />
			</CTAMenuItem>
		</>
	)
}

const Container = styled.header`
	width: 100%;
	position: fixed;
	background-color: rgba(0, 0, 0, 0.05);
	backdrop-filter: blur(38px);
	border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	z-index: 100;
`

const Nav = styled.nav`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem;
	max-width: 1200px;
	margin: 0 auto;
`

const NavStart = styled.div`
	position: relative;

	@media (min-width: 768px) {
		display: none;
	}
`

const NavCenter = styled.div`
	display: none;
	@media (min-width: 768px) {
		display: flex;
		justify-content: center;
	}
`

const NavEnd = styled.div`
	display: flex;
	justify-content: flex-end;
`

const MenuButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	cursor: pointer;
	padding: 0.5rem;
	color: white;

	&:hover {
		opacity: 0.8;
	}
`

const MenuIcon = styled.svg`
	width: 1.25rem;
	height: 1.25rem;
`

const SidebarOverlay = styled.div<{ $isOpen: boolean }>`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 200;
	display: ${(props) => (props.$isOpen ? "block" : "none")};

	@media (min-width: 768px) {
		display: none;
	}
`

const MobileSidebar = styled.div<{ $isOpen: boolean }>`
	position: fixed;
	top: 0;
	left: 0;
	width: 280px;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.05);
	backdrop-filter: blur(38px);
	border-right: 1px solid rgba(255, 255, 255, 0.1);
	z-index: 201;
	transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
	transition: transform 0.3s ease-in-out;
	box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);

	@media (min-width: 768px) {
		display: none;
	}
`

const SidebarHeader = styled.div`
	display: flex;
	justify-content: flex-end;
	padding: 1rem;
`

const CloseButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	cursor: pointer;
	padding: 0.5rem;
	color: white;

	&:hover {
		opacity: 0.8;
	}
`

const CloseIcon = styled.svg`
	width: 1.5rem;
	height: 1.5rem;
`

const SidebarContent = styled.ul`
	list-style: none;
	padding: 0 1rem;
	margin: 0;
`

const MenuList = styled.ul`
	display: flex;
	list-style: none;
	padding: 0;
	margin: 0;

	@media (min-width: 768px) {
		flex-direction: row;
		gap: 1.5rem;
	}
`

const MenuItem = styled.li`
	margin: 0.75rem 0;

	@media (min-width: 768px) {
		margin: 0;
	}
`

const CTAMenuItem = styled.li`
	margin: 2rem 0;
	display: flex;
	align-items: center;
	justify-content: center;

	@media (min-width: 768px) {
		margin: 0;
		margin-left: 0.5rem;
		justify-content: flex-start;
	}
`

const MenuLink = styled.a`
	display: block;
	padding: 0.75rem 1rem;
	color: white;
	text-decoration: none;
	font-size: 1.1rem;
	border-radius: 0.375rem;
	transition: background-color 0.2s ease;

	&:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	@media (min-width: 768px) {
		padding: 0.5rem 0;
		font-size: 1rem;

		&:hover {
			background-color: transparent;
			text-decoration: underline;
		}
	}
`
