<script lang="ts">

    let dropZone, dropzoneContainer, files = [], accepted = [], rejected = [];

    function dragIgnore(evt) {
        evt.stopPropagation();
        evt.preventDefault();
    }

    function drop(evt) {
        dragIgnore(evt);

        if (evt.dataTransfer.items) {
            [...evt.dataTransfer.items].forEach((item, i) => {
                if (item.kind === 'file') {
                    let file = item.getAsFile();
                    files.push(file);
                    console.log(file);

                    let previewElement = document.createElement('div');
                    previewElement.className = 'preview-element';
                    previewElement.appendChild(document.createTextNode(file.name))
                    let imgElement = document.createElement('img');
                    imgElement.id = file.name;
                    imgElement.className = 'image-preview';


                    let reader = new FileReader();
                    reader.onload = (evt) => {
                        imgElement.src = evt.target.result;
                        previewElement.appendChild(imgElement);
                        dropZone.appendChild(previewElement);
                    }
                    reader.onerror = (err) => {
                        console.log('error', err);
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    function upload() {
        const payload = new FormData()

        for (let i = 0; i < files.length; i++) {
            payload.append(`file_${i}`, files[i], files[i].name)
        }
        payload.append('count', files.length);

        const uploadRequest = fetch('/api/pictures', {
            method: 'POST',
            body: payload
        }).then(res => {
            res.json().then(data => {
                $: accepted = data.accepted;
                $: rejected = data.rejected;

                data.accepted.forEach(a => {
                    console.log(a);
                    document.getElementById(a).classList.add('image-accepted');
                })
                data.rejected.forEach(r => {
                    console.log(document.getElementById(r));
                    document.getElementById(r).classList.add('image-rejected');
                })
            })
        })
    }
</script>

<main>
    <h2>Import</h2>
    <div id="dropzone-container" bind:this={dropzoneContainer}>
        <div id="dropzone" bind:this={dropZone} on:drop={drop} on:dragover={dragIgnore} on:dragenter={dragIgnore}></div>
        <button on:click={upload}>Envoyer</button>
    </div>
    Photos acceptées : <br/>
    {accepted} <br/>
    Photos rejettées :<br/>
    {rejected} <br/>
</main>


<style type="text/scss">
  main {
    width: 80vw;
    position: fixed;
    top: 10vh;
    left: 10vw;
  }

  #dropzone-container {
    display: flex;
    flex-direction: column;

    #dropzone {
      margin-bottom: 2vh;
      min-height: 20vh;
      width: 100%;
      border: 1px dashed #ccc;
      border-radius: 5px;
      display: flex;
      flex-wrap: wrap;
    }

    button {
      font-size: 1.5em;
      font-weight: bold;
      border-radius: 5px;
    }
  }

  :global(.preview-element) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: monospace;
    font-size: 1.5em;
  }

  :global(.image-preview) {
    height: 200px;
    min-width: 100px;
    border: 3px solid blue;
    margin: 10px;
  }

  :global(.image-accepted) {
    border: 3px solid green !important;
  }

  :global(.image-rejected) {
    border: 3px solid red !important;
  }
</style>
