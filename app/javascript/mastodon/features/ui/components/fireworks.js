import React, { useState, useEffect } from 'react';
import ImmutablePureComponent from 'react-immutable-pure-component';

import Button from '../../../components/button'

const DEFAULT_COLOUR = "#000000"

const SECONDS = 1000
const MILIS = 1

const DEG2RAD = Math.PI / 180

const FIREWORK_START_Y = window.innerHeight - 10

const COLOURS = [
        "#FF0000", // red
        "#00FF00", // green
        "#0000FF", // blue
        //"#FFFF00", // Yellow
        "#FF00FF", // Magenta
        "#00FFFF", // Cyan
        //"#000000", // black
]


/*
 * Clears the specified canvas. Useful before drawing the
 * next frame
 *
 * !!IMPURE!!
 */
const clearCtx = ctx => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
}

/*
 * Produces a random float in the range [lb, ub)
 */
const randomRange = (lb, ub) => Math.random() * (ub - lb) + lb

/*
 * Selects a random element from an array
 */
const randomChoice = arr => arr[Math.floor(randomRange(0, arr.length))]

/*
 * Keeping track of game objects
 * Overkill? Sure. But whatcha gonna do
 */
const updatables = []
const drawables = []

/*
 * Fancy fanciness for adding objects to the correct arrays
 * for updating them in the game loop
 *
 * In a sense, registers obj with the engine
 *
 * More power than strictly necessary, but hey, it works great
 *
 * !!IMPURE!!
 */
const registerObj = obj => {
        if (obj && obj.hasOwnProperty("draw")) drawables.push(obj)
        if (obj && obj.hasOwnProperty("update")) updatables.push(obj)
}

/*
 * If register is create, this is delete. Removes objects from the
 * engine and lets them be garbage collected.
 *
 * TODO: move all garbage collections jobs until it is more convenient
 *
 * !!IMPURE!!
 */
const unregisterObj = obj => {
        if (obj && obj.hasOwnProperty("draw"))
                drawables.splice(
                        drawables.indexOf(obj),
                        1)
        if (obj && obj.hasOwnProperty("update"))
                updatables.splice(
                        updatables.indexOf(obj),
                        1)
}


/*
 * Gimme a circle.
 *
 * Draws a circle of speficied radius and colour at x,y on
 * the canvas associated with the context ctx
 *
 * !!IMPURE!!
 */
const drawCircle = (ctx, x, y, radius, colour) => {
        ctx.fillStyle = colour
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill()
        ctx.fillStyle = DEFAULT_COLOUR
}



/*
 * The big heavy weight of the application, where all the *magic* happens
 * Called on button click, currently
 *
 */
let started = false
const mkfireworkStart = id =>
function startFireworks(){
        if (started) return
        started = true
        console.log("Starting fireworkds")
        const cnv = document.querySelector(`#${id}`)
        const ctx = cnv.getContext("2d")
        clearCtx(ctx)

        const fireworkConfig = {
                lifetime : randomRange(1 * SECONDS, 2 * SECONDS),
                dx: randomRange(-0.01, 0.01)
        }

        // make all starting firewords
        for (let i = 0; i < 20; i++){
                const fireworkConfig = {
                        lifetime : randomRange(0.3 * SECONDS, 4 * SECONDS),
                        dx: randomRange(-0.05, 0.05),
                        speed: randomRange(0.1, 0.3),
                        delay: randomRange(10, 1 * SECONDS) * i
                }
                const startX = Math.round(randomRange(50, window.innerWidth))
                registerObj(new Firework(startX, randomChoice(COLOURS), fireworkConfig))
        }

        let prevTime = undefined
        let totalTime = 0

        // Main game (animation?) loop, in weird funky
        // javascript mutual recursion style
        function frame(timeStamp){
                //init
                if (!prevTime) prevTime = timeStamp
                const elapsedTime = timeStamp - prevTime // helps moves things at a constant rate
                prevTime = timeStamp

                //update
                for (const obj of updatables) obj.update(elapsedTime)

                // drawing
                clearCtx(ctx)
                for (const obj of drawables) obj.draw(ctx)

                // Cleanup and advancing conditions
                totalTime += elapsedTime
                if (!(updatables.length == 0 && drawables.length == 0)) // stop after 3 seconds
                        window.requestAnimationFrame(frame) // weird mutual recursion, but okay
                else{
                        clearCtx(ctx)
                        console.log("Firworkds over")
                        started = false
                }
        }

        window.requestAnimationFrame(frame) // weird repeat joke, but okay
}

/*
 * AHHHHH OBJECT ORIENTED PROGRAMMING WHY WOULD YOU DO THIS
 *
 * TODO: Don't use objects, or functions with `new`
 *
 * This is a class representing a firework, takes care of drawing and updating fireworks
 *
 * !!IMPURE!!
 */
function Firework(
        initX,
        colour,
        {
                lifetime = 2 * SECONDS,
                speed = 0.1,
                dx = 0.01,
                delay = 0,
                drag = 0.001,
                trail_length = 50,
                explode = true
        } = {}){
        this.x = initX
        this.y = FIREWORK_START_Y
        this.past_points = []
        this.size = 3
        this.colour = colour
        this.time = 0
        this.lifetime = lifetime
        this.speed = speed
        this.dx = dx
        this.delay = delay
        this.drag = drag
        this.trail_length = trail_length
        this.explode = explode

        /*
         * Draw the current firework to the canvas
         */
        this.draw = ctx => {
                if (this.time < this.delay) return
                drawCircle(ctx, this.x, this.y, this.size, this.colour) // draw the star

                // draw the tail
                if (this.past_points.length > this.trail_length) {
                        this.past_points.shift()
                }

                ctx.strokeStyle = this.colour
                ctx.beginPath()
                ctx.moveTo(this.x, this.y)
                for (const {x, y} of this.past_points.reverse()) {
                        ctx.lineTo(x, y)
                        ctx.moveTo(x, y)
                }
                this.past_points.reverse()
                ctx.stroke()
                ctx.strokeStyle = DEFAULT_COLOUR

                this.past_points.push({x: this.x, y: this.y})
        }

        this.update = elapsedTime => {
                this.time += elapsedTime
                if (this.time < this.delay) return

                // Physics? Close enough
                this.y -= this.speed * elapsedTime // smoothes movement with inconsistent framerate
                this.x += this.dx * elapsedTime // samesies
                this.speed -= this.drag

                if (this.time > this.lifetime + this.delay) {
                        unregisterObj(this) // delete
                        if (!this.explode) return
                        const lines = 10
                        // Create some new trails, like an explosion
                        for (let i = 0; i < lines; i++){
                                const angle_deg = 360 * (i / lines)
                                const angle_rad = angle_deg * DEG2RAD
                                const dx = Math.cos(angle_rad) // magic trig
                                const dy = Math.sin(angle_rad) // magic trig
                                const config = {
                                        lifetime : 0.8 * SECONDS,
                                        speed : dy * 0.1,
                                        dx : dx * 0.1,
                                        drag : this.drag,
                                        explode : false
                                }
                                // TODO: Don't make a bunch of extra fireworks, the GC dies later
                                const expl = new Firework(0, this.colour, config) // reusing code ?
                                expl.x = this.x
                                expl.y = this.y
                                expl.size = 1
                                registerObj(expl) // add new fireworks to engine
                        }
                }
        }
}

const canvasStyle = {
        position: 'fixed',
        margin:0,
        padding:0,
        pointerEvents: 'none',
        float: 'left',
        zIndex:100
}

function Canvas({ id }){
        const cnv = <canvas
                width={window.innerWidth}
                height={window.innerHeight}
                id={id}
                style={canvasStyle}></canvas>
        return (
                cnv
        )
}

export default function Fireworks(props){
        const cnvId = "violet-fireworks-canvas"
        return (
                <div style={{position:'fixed'}}>
                <canvas
                        width={window.innerWidth}
                        height={window.innerHeight}
                        id={cnvId}
                        style={canvasStyle}></canvas>
                <Button onClick={mkfireworkStart(cnvId)}>Start Fireworks</Button>
                </div>
        )
}
