<script lang="ts">
    import Checkmark from "$lib/svgs/checkmark--outline.svg?component";
    import Error from "$lib/svgs/error.svg?component";
    import Pending from "$lib/svgs/pending.svg?component";

    let dropZone, dropzoneContainer, files = [], accepted = [], rejected = [],
        buttonDisabled = true,
        currentStep = 0;

    let statuses = undefined;

    function dragIgnore(evt) {
        evt.stopPropagation();
        evt.preventDefault();
    }

    function drop(evt) {
        currentStep = 1;
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

    async function upload() {
        currentStep = 2;
        buttonDisabled = true;
        const payload = new FormData();

        let _statuses = {};
        for (let i = 0; i < files.length; i++) {
            payload.append(`file_${i}`, files[i], files[i].name)
            _statuses[files[i].name] = {
                fileName: files[i].name,
                exif: undefined,
                full: undefined,
                db: undefined,
                thumb: undefined,
                half: undefined,
            };
        }
        $: statuses = _statuses;
        payload.append('count', files.length);

        const response = await fetch('/api/pictures', {
            method: 'POST',
            body: payload
        });
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        console.log('reader started');
        while (true) {
            const {value, done} = await reader.read();
            console.log(JSON.parse(value).data);
            const record = JSON.parse(value).data;
            console.log(record.fileName, record.step, record.status)
            statuses[record.fileName][record.step] = record.status;
            if (done) break;
        }
        currentStep = 3;
    }
</script>

<main>
    <h2>Import</h2>

    <div id="dropzone-container" bind:this={dropzoneContainer}>
        <div id="dropzone" bind:this={dropZone} on:drop={drop} on:dragover={dragIgnore} on:dragenter={dragIgnore}></div>
        <button class:disabled={currentStep >= 2} on:click={upload}>Envoyer</button>
    </div>

    <div id="steps">
        <div class="step" class:active={currentStep >= 1}>
            <div class="step-id">1</div>
            <div class="step-name">Sélection</div>
        </div>
        <div class="step-line" class:active={currentStep >= 2}></div>
        <div class="step" class:active={currentStep >= 2}>
            <div class="step-id">2</div>
            <div class="step-name">Envoi</div>
        </div>
        <div class="step-line" class:active={currentStep >= 3}></div>
        <div class="step" class:active={currentStep >= 3}>
            <div class="step-id">3</div>
            <div class="step-name">Validation</div>
        </div>
    </div>

    <div id="logs">
        <div id="statuses-header">
            <div class="status-header-cell">File Name</div>
            <div class="status-header-cell">Exif</div>
            <div class="status-header-cell">Full</div>
            <div class="status-header-cell">DB</div>
            <div class="status-header-cell">Half</div>
            <div class="status-header-cell">Thumb</div>
        </div>
        {#if statuses}
            {#each Object.keys(statuses) as fname}
                <div class="status-row">
                    <div class="status-cell">{fname}</div>
                    {#each ['exif', 'full', 'db', 'half', 'thumb'] as step}
                        <div class="status-cell">
                            {#if statuses[fname][step] === undefined}
                                <Pending width=30 height=30 fill="#03A9F4"/>
                            {:else}
                                {#if statuses[fname][step]}
                                    <Checkmark width=30 height=30 fill="#8BC34A"/>
                                {:else}
                                    <Error width=30 height=30 fill="#FF5722"/>
                                {/if}
                            {/if}
                        </div>
                    {/each}
                </div>
            {/each}
        {/if}
    </div>
</main>


<style lang="scss">
  @import "$src/color.scss";
  @import "$src/fonts.scss";

  main {
    width: 80vw;
    position: fixed;
    top: 10vh;
    left: 10vw;

    h2 {
      @include f-p-b;
    }
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
      @include f-p-2;
      font-size: 2em;
      outline: none !important;
      border: none !important;
      padding: 5px;
      box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
      border-radius: 5px;
      background-color: $subcolor;
      color: white;

      &.disabled {
        background-color: #aaa;
      }
    }
  }

  #steps {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .step-line {
      width: 40%;
      border-bottom: 3px solid #aaa;

      &.active {
        border-color: $subcolor;
      }
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100px;

      &.active {
        .step-id {
          background-color: $subcolor;
        }

        .step-name {
          color: black;
        }
      }

      .step-id {
        background-color: #aaa;
        color: white;
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        border-radius: 50%;
        @include f-p-2;
        font-size: 1.5em;
        font-weight: bold;
      }

      .step-name {
        @include f-p-2;
        font-size: 1.5em;
        color: #aaa;
      }
    }
  }

  #logs {
    margin-top: 30px;
    width: 100%;

    #statuses-header {
      @include f-p-2;
      font-size: 1.5em;
      display: flex;
      justify-content: space-between;
      width: 100%;
      border-bottom: 1px solid $subcolor;
    }

    .status-cell, .status-header-cell {
      width: 16%;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      width: 100%;

      .status-cell {
        min-width: 50px;
        font-family: monospace;
      }
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
