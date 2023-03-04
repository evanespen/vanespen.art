<script>
    import {onMount} from "svelte"
    import Renew from '$lib/svgs/renew.svg?url';
    import Trashcan from '$lib/svgs/trashcan.svg?url';
    import View from '$lib/svgs/view.svg?url';
    import {goto} from "$app/navigation";

    import Checkmark from "$lib/svgs/checkmark--outline.svg?component";
    import Error from "$lib/svgs/error.svg?component";
    import Pending from "$lib/svgs/pending.svg?component";

    let newReview = {
        name: '',
        password: ''
    }
    let reviews = [];
    let statuses = {}, archiveDone = undefined;

    function loadReviews() {
        fetch('/api/reviews').then(res => {
            res.json().then(data => {
                $: reviews = data.reviews
            })
        })
    }

    function handleNewReview() {
        console.log(newReview.name, newReview.password);

        fetch('/api/reviews', {
            method: 'POST',
            body: JSON.stringify(newReview)
        }).then(res => {
            console.log(res)
            loadReviews()
        })
    }

    async function handleRefresh(name) {

        const response = await fetch(`/api/reviews/${name}`, {
            method: 'PUT',
            body: JSON.stringify({
                action: 'refresh'
            })
        });
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        console.log('reader started');
        while (true) {
            const {value, done} = await reader.read();
            const data = JSON.parse(value).data;

            if (data.fileName === 'archive') {
                archiveDone = data.status;
            } else {
                if (!Object.keys(statuses).includes(data.fileName)) {
                    let _statuses = statuses;
                    _statuses[data.fileName] = {
                        db: undefined,
                        half: undefined,
                    };
                    $: statuses = _statuses;
                }

                $: statuses[data.fileName][data.step] = data.status;
            }

            if (done) break;
        }
    }

    function handleDelete(name) {
        fetch(`/api/reviews/${name}`, {
            method: 'DELETE',
        }).then(res => {
            console.log(res)
            loadReviews()
        })
    }

    function handleView(name) {
        console.log(name)
        goto(`/reviews/${name}`)
    }

    onMount(() => {
        loadReviews()
    })
</script>

<main>
    <h1>Revues</h1>
    <h2>Nouveau</h2>
    <div id="new-review-form">
        <label for="newReviewName">Nom</label>
        <input id="newReviewName" type="text" bind:value={newReview.name}>
        <label for="newReviewPassword">Mot de passe</label>
        <input type="text" bind:value={newReview.password}>
        <button on:click={handleNewReview}>Valider</button>
    </div>

    <div id="reviews">
        <div id="reviews-header">
            <div class="cell">Nom</div>
            <div class="cell">Mot de passe</div>
            <div class="cell">Photos</div>
            <div class="actions">Actions</div>
        </div>
        {#each reviews as review}
            <div class="review">
                <div class="cell">{review.name}</div>
                <div class="cell">{review.password}</div>
                <div class="cell">{review.pictures.length}</div>
                <div class="actions">
                    <button class="btn-error" on:click={() => handleView(review.name)}><img class="icon" src={View}
                                                                                            alt=""></button>
                    <button class="btn-error" on:click={() => handleRefresh(review.name)}><img class="icon" src={Renew}
                                                                                               alt=""></button>
                    <button class="btn-error" on:click={() => handleDelete(review.name)}><img class="icon"
                                                                                              src={Trashcan} alt="">
                    </button>
                </div>
            </div>
        {/each}
    </div>

    <div id="archives">
        <h1>Archives</h1>
        <div id="archives-row">
            <div class="archives-cell">Archives</div>
            <div class="archives-cell">
                {#if archiveDone === undefined}
                    <Pending width=30 height=30 fill="#03A9F4"/>
                {:else}
                    {#if archiveDone}
                        <Checkmark width=30 height=30 fill="#8BC34A"/>
                    {:else}
                        <Error width=30 height=30 fill="#FF5722"/>
                    {/if}
                {/if}
            </div>
        </div>
    </div>

    <div id="logs">
        <h1>Status</h1>
        <div id="logs-header">
            <div class="log-cell">Fichier</div>
            <div class="log-cell">DB</div>
            <div class="log-cell">Half</div>
        </div>
        {#each Object.keys(statuses) as fname}
            <div class="log-row">
                <div class="log-cell">{fname}</div>
                {#each ['db', 'half'] as step}
                    <div class="log-cell">
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
    </div>
</main>

<style lang="scss">
  @import "$src/color.scss";
  @import "$src/fonts.scss";

  main {
    @include f-p-2;
    width: 80vw;
    position: fixed;
    top: 10vh;
    left: 10vw;

    h1, h2 {
      @include f-p-b;
    }

    #new-review-form {
      @include f-p-2;
      display: flex;
      flex-direction: column;

      input, label, button {
        width: 100%;
        margin-top: 10px;
      }

      label, input {
        font-size: 1.5rem;
      }

      button {
        @include f-p-b;
        font-size: 2em;
        outline: none !important;
        border: none !important;
        padding: 5px;
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        background-color: $subcolor;
        color: white;

        &:hover {
          cursor: pointer;
        }
      }
    }

    #reviews {
      width: 100%;

      #reviews-header {
        @include f-p-b;
        margin-top: 50px;
      }

      #reviews-header, .review {
        height: 30px;
        display: flex;

        .cell {
          width: 30%;
        }

        .actions {
          width: 10%;
        }
      }

      .review {
        .cell {
          width: 30%;
        }

        .actions {
          display: flex;
          width: 10%;
          align-items: center;
          justify-content: space-between;
        }


        button {
          border: none;
          outline: none;
          background: none;
          color: black;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 20px;

          img {
            height: 20px;
            width: 20px;
          }

          &:hover {
            cursor: pointer;
          }

          &.btn-error {
            color: red;
          }
        }
      }
    }

    #archives {
      width: 100%;

      #archives-row {
        width: 100%;
        display: flex;
        justify-content: space-between;

        .archives-cell {
          width: 50%;
        }
      }
    }

    #logs {
      width: 100%;

      #logs-header {
        @include f-p-2;
        font-size: 1.5em;
        display: flex;
        justify-content: space-between;
        width: 100%;
        border-bottom: 1px solid $subcolor;
        margin-bottom: 20px;
      }

      #logs-header, .log-row {
        display: flex;
        justify-content: space-between;
        width: 100%;

        .log-cell {
          width: 30%;
        }
      }
    }
  }
</style>