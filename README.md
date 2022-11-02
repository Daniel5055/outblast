# OutBlast

OutBlast is a two player shoot-em game that takes place in an system of orbiting bodies. Each player controls a ship, which is either a red or blue ball and the aim is to eliminate the other player. This was created for the Hack The Bubble 2022 Hackathon, which gave 8 hours to create something sci-fi themed.

![image](https://user-images.githubusercontent.com/29730245/199613117-e5d4fdd3-d1db-45ee-a5f9-389da20292fd.png)

## How to Play

The red player controls the ship using w a s d, whilst the blue player controls the ship using the arrow keys. Players start on the central body, when on a body, players can move their cannons left or right using a and d or left arrow and right arrow respectively. To shoot a bullet, the player can press s or the down key respectively. To jump in the direction the cannon is facing, the player can press the w or the up key.

Bullets shot and players that jump are subject to the gravity in the system and so must adjust as such. Players can only shoot as many bullets as signified by the number in the bodies. Those will regenerate over time, yet it would be wise for players to jump to other orbiting bodies to use those supply of bullets also. When a bullet hits the player on a body or whilst in orbit, the other player thus wins. If the players collide with each other in orbit, then they both lose.

And that is all there is to it!

## Technology

The website was created using SvelteKit with TypeScript and is hosted from Vercel at the url [https://outblast.vercel.app](https://outblast.vercel.appp).
