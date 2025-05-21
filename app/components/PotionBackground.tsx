"use client"
import { useRef, useEffect, useState } from "react"
import createFragmentShader from "../shaders/background"
import { FragmentShader } from "../shaders/types"

export const PotionBackground = () => {
	const containerRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const requestRef = useRef<number>()
	const timeRef = useRef<number>(0)
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
	const [scale, setScale] = useState(1)
	const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0, top: 0, left: 0 })

	useEffect(() => {
		// Set scale based on device pixel ratio
		const pixelRatio = window.devicePixelRatio * 2 || 1
		setScale(pixelRatio)
	}, [])

	useEffect(() => {
		if (!containerRef.current) return

		const updateDimensions = (el: HTMLElement) => {
			const { width, height } = el.getBoundingClientRect()
			setDimensions({ width, height })

			// Calculate canvas dimensions maintaining 3:2 aspect ratio while covering container
			const containerRatio = width / height
			const targetRatio = 8 / 1

			let canvasWidth, canvasHeight, top, left

			if (containerRatio > targetRatio) {
				// Container is wider than 16:1 - canvas will match container width and extend beyond height
				canvasWidth = width
				canvasHeight = width / targetRatio
				top = (height - canvasHeight) / 2
				left = 0
			} else {
				// Container is taller than 3:2 - canvas will match container height and extend beyond width
				canvasHeight = height
				canvasWidth = height * targetRatio
				top = 0
				left = (width - canvasWidth) / 2
			}

			setCanvasDimensions({ width: canvasWidth, height: canvasHeight, top, left })
		}

		// Initialize dimensions
		updateDimensions(containerRef.current)

		// Set up ResizeObserver
		const resizeObserver = new ResizeObserver((entries) => {
			if (entries.length > 0) {
				updateDimensions(entries[0].target as HTMLElement)
			}
		})

		resizeObserver.observe(containerRef.current)

		return () => {
			resizeObserver.disconnect()
		}
	}, [])

	useEffect(() => {
		if (!canvasRef.current || canvasDimensions.width === 0 || canvasDimensions.height === 0) return

		const canvas = canvasRef.current
		const pixelRatio = window.devicePixelRatio || 1
		canvas.width = canvasDimensions.width * pixelRatio
		canvas.height = canvasDimensions.height * pixelRatio

		// Initialize WebGL
		const gl = canvas.getContext("webgl")
		if (!gl) {
			console.error("WebGL not supported")
			return
		}

		// Set viewport to match canvas size
		gl.viewport(0, 0, canvas.width, canvas.height)

		// Create shader program
		const shaderResult = createFragmentShader({
			blurAmount: 1000
			// blurExponentRange: [0.2, 1]
		})
		// Check if result is a FragmentShader object
		if (typeof shaderResult === "string") {
			console.error("Expected FragmentShader object but got string")
			return
		}
		const { shader: fragmentShaderSource, uniforms } = shaderResult as FragmentShader

		// Vertex shader - simple pass-through
		const vertexShaderSource = `
			attribute vec2 a_position;
			void main() {
				gl_Position = vec4(a_position, 0, 1);
			}
		`

		// Create and compile shaders
		const vertexShader = gl.createShader(gl.VERTEX_SHADER)
		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

		if (!vertexShader || !fragmentShader) {
			console.error("Could not create shaders")
			return
		}

		gl.shaderSource(vertexShader, vertexShaderSource)
		gl.shaderSource(fragmentShader, fragmentShaderSource)
		gl.compileShader(vertexShader)
		gl.compileShader(fragmentShader)

		// Check for compilation errors
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			console.error("Vertex shader compilation error:", gl.getShaderInfoLog(vertexShader))
			return
		}
		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			console.error("Fragment shader compilation error:", gl.getShaderInfoLog(fragmentShader))
			return
		}

		// Create and link program
		const program = gl.createProgram()
		if (!program) {
			console.error("Could not create program")
			return
		}

		gl.attachShader(program, vertexShader)
		gl.attachShader(program, fragmentShader)
		gl.linkProgram(program)

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error("Program linking error:", gl.getProgramInfoLog(program))
			return
		}

		gl.useProgram(program)

		// Create a buffer for the positions
		const positionBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
		const positions = [-1, -1, 1, -1, -1, 1, 1, 1]
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

		// Get attribute location
		const positionLocation = gl.getAttribLocation(program, "a_position")
		gl.enableVertexAttribArray(positionLocation)
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

		// Get uniform locations
		const timeLocation = gl.getUniformLocation(program, "u_time")
		const widthLocation = gl.getUniformLocation(program, "u_w")
		const heightLocation = gl.getUniformLocation(program, "u_h")
		const gradientLocation = gl.getUniformLocation(program, "u_gradient")

		// Create gradient texture
		const gradientTexture = gl.createTexture()
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, gradientTexture)

		// Create gradient data - purple to teal gradient
		const gradientData = new Uint8Array([
			128,
			0,
			128,
			255, // purple
			0,
			128,
			128,
			255, // teal
			64,
			0,
			128,
			255, // dark purple
			0,
			64,
			128,
			255 // dark teal
		])

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, gradientData)

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

		// Set uniform values
		gl.uniform1i(gradientLocation, 0) // Use texture unit 0
		gl.uniform1f(widthLocation, canvas.width)
		gl.uniform1f(heightLocation, canvas.height)

		// Animation loop
		const render = (time: number) => {
			timeRef.current = time * 0.001 // Convert to seconds

			gl.uniform1f(timeLocation, timeRef.current)
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

			requestRef.current = requestAnimationFrame(render)
		}

		requestRef.current = requestAnimationFrame(render)

		// Cleanup function
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current)
			}

			// Clean up WebGL resources
			gl.deleteProgram(program)
			gl.deleteShader(vertexShader)
			gl.deleteShader(fragmentShader)
			gl.deleteBuffer(positionBuffer)
			gl.deleteTexture(gradientTexture)
		}
	}, [canvasDimensions])

	return (
		<div
			ref={containerRef}
			style={{
				backgroundColor: "black",
				width: "100%",
				height: "100%",
				overflow: "hidden",
				position: "absolute",
				top: 0,
				left: 0,
				zIndex: -1
			}}
		>
			<canvas
				ref={canvasRef}
				width={canvasDimensions.width}
				height={canvasDimensions.height}
				style={{
					display: "block",
					position: "absolute",
					width: `${canvasDimensions.width}px`,
					height: `${canvasDimensions.height}px`,
					top: `${canvasDimensions.top}px`,
					left: `${canvasDimensions.left}px`,
					transform: `scale(${scale})`,
					transformOrigin: "0 0"
				}}
			/>
		</div>
	)
}
