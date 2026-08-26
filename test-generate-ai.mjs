async function run() {
  try {
    const res = await fetch('http://localhost:3099/api/library/workouts/generate-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt:
          '2.4km warm up\n400m of alternating 50m Drills with 50m Strides\n8x 400m at 5km Race Effort or around 103% Threshold Pace, with 200m of jogging recovery\n1.2km cool down',
        saveToLibrary: false,
        ownerScope: 'athlete'
      })
    })
    console.log(res.status)
    console.log(await res.text())
  } catch (e) {
    console.error(e)
  }
}
run()
