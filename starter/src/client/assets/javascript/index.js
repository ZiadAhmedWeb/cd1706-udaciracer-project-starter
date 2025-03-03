// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	track_name: undefined,
	player_id: undefined,
	player_name: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	console.log("Getting form info for dropdowns!")
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
			store.track_id = target.id
			store.track_name = target.innerHTML
		}

		// Racer form field
		if (target.matches('.card.racer')) {
			handleSelectRacer(target)
			store.player_id = target.id
			store.player_name = target.innerHTML
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

		console.log("Store updated :: ", store)
	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}

// ^ PROVIDED CODE ^ DO NOT REMOVE

// BELOW THIS LINE IS CODE WHERE STUDENT EDITS ARE NEEDED ----------------------------
// TIP: Do a full file search for TODO to find everything that needs to be done for the game to work

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
    console.log("in create race");

    // Render starting UI
    renderAt('#race', renderRaceStartView(store.track_name));

    // Get player_id and track_id from the store
    let player = store.player_id;
    let track = store.track_id;

    try {
        // Call the asynchronous method createRace, passing the correct parameters
        const race = await createRace(player, track); // Await the response

        // Update the store with the race id in the response
        store.race_id = race.ID; // Assuming the response has an 'id' property

        // TIP - console logging API responses can be really helpful to know what data shape you received
        console.log("RACE: ", race);

        // Start the countdown and then the race
        await runCountdown(); // Wait for the countdown to finish
        await startRace(store.race_id); // Start the race with the race ID
        await runRace(store.race_id); // Begin tracking the race progress

    } catch (error) {
        console.error("Error creating race:", error); // Handle any errors
    }
}


function runRace(raceID) {
	return new Promise(resolve => {
	// TODO - use Javascript's built in setInterval method to get race info (getRace function) every 500ms
	const raceInterval = setInterval(async () => {
		try {
			const res = await getRace(raceID); // Call getRace with raceID

			// Check if the race info status property is "in-progress"
			if (res.status === "in-progress") {
				renderAt('#leaderBoard', raceProgress(res.positions)); // Update the leaderboard
			}

			// Check if the race info status property is "finished"
			if (res.status === "finished") {
				clearInterval(raceInterval); // Stop the interval from repeating
				renderAt('#race', resultsView(res.positions)); // Render the results view
				resolve(res); // Resolve the promise
			}
		} catch (error) {
			clearInterval(raceInterval); // Clear the interval on error
			reject(error); // Reject the promise with the error
		}
	}, 500);
	})
	// remember to add error handling for the Promise
}

async function runCountdown() {
    try {
        // wait for the DOM to load
        await delay(1000);
        let timer = 3;

        return new Promise(resolve => {
            const countdownInterval = setInterval(() => {
                document.getElementById('big-numbers').innerHTML = --timer;

                // When the timer hits 0, clear the interval, resolve the promise, and return
                if (timer <= 0) {
                    clearInterval(countdownInterval);
                    resolve();
                }
            }, 1000); // Count down once per second
        });
    } catch (error) {
        console.log(error);
    }
}


function handleSelectRacer(target) {
	console.log("selected a racer", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')
}

function handleSelectTrack(target) {
	console.log("selected track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selecte')
	if (selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')	
}

function handleAccelerate() {
	console.log("accelerate button clicked")
	// TODO - Invoke the API call to accelerate
	async function accelerate(raceID, playerID) {
		try {
			const response = await fetch(`https://your-api-url.com/races/${raceID}/accelerate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ player_id: playerID }), // Send the player ID in the request body
			});
	
			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}
	
			const data = await response.json(); // Parse the JSON response
			console.log("Acceleration Response: ", data); // Log the response for debugging
	
			// You can add additional logic here to update the UI based on the response
	
		} catch (error) {
			console.error("Error accelerating: ", error); // Handle any errors
		}
	}
	
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer
	// OPTIONAL: There is more data given about the race cars than we use in the game, if you want to factor in top speed, acceleration, 
	// and handling to the various vehicles, it is already provided by the API!
	return `<h4 class="card racer" id="${id}">${driver_name}</h3>`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `<h4 id="${id}" class="card track">${name}</h4>`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	userPlayer.driver_name += " (you)"
	let count = 1
  
	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			<h3>Race Results</h3>
			<p>The race is done! Here are the final results:</p>
			${results.join('')}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === parseInt(store.player_id))
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<table>
			${results.join('')}
		</table>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = window.location.origin

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
    console.log(`calling server :: ${SERVER}/proxy/3001/api/tracks`);
    // GET request to `${SERVER}/proxy/3001/api/tracks`
    return fetch(`${SERVER}/proxy/3001/api/tracks`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
      //  .then(data => {
         //   return data.tracks; // Return the tracks
        //})
        .catch(error => {
            console.log("Can't fetch tracks:", error);
        });
}

function getRacers() {
    console.log(`calling server :: ${SERVER}/proxy/3001/api/cars`);
    // GET request to `${SERVER}/proxy/3001/api/cars`
    return fetch(`${SERVER}/proxy/3001/api/cars`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        //.then(data => {
          //  return data.racers; // Return the racers
        //})
        .catch(error => {
            console.log("Can't fetch racers:", error);
        });
}
function createRace(player_id, track_id) {
    player_id = parseInt(player_id);
    track_id = parseInt(track_id);
    const body = { player_id, track_id };

    return fetch(`${SERVER}/proxy/3001/api/races`, {
        method: 'POST',
        ...defaultFetchOpts(),
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .catch(err => console.log("Problem with createRace request::", err));
}

function getRace(id) {
    return fetch(`${SERVER}/proxy/3001/api/races/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.log("Can't fetch race information:", error);
        });
}

function startRace(id) {
	fetch(`${SERVER}/proxy/3001/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with getRace request::", err))
}

function accelerate(id) {
    fetch(`${SERVER}/proxy/3001/api/races/${id}/accelerate`, {
        method: 'POST',
        ...defaultFetchOpts(),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .catch(error => {
        console.log("Problem with accelerate request:", error);
    });
}
