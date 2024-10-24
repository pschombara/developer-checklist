self.addEventListener('message', message => {
    if ('' !== message.data.message) {
        console.log(message.data)
        fetch(message.data.room, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: message.data.message,
        }).then(response => {
            if (response.ok) {
                postMessage({type: 'success'})
            } else {
                postMessage({type: 'error'})
            }
        }).catch(error => console.log(error))
    }
})
