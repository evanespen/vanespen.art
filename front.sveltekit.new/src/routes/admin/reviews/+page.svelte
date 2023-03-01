<script>
    import {onMount} from "svelte"
    import Renew from '$lib/svgs/renew.svg?url';
    import Trashcan from '$lib/svgs/trashcan.svg?url';
    import View from '$lib/svgs/view.svg?url';
    import {goto} from "$app/navigation";

    let newReview = {
        name: '',
        password: ''
    }
    let reviews = []

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

    function handleRefresh(name) {
        fetch(`/api/reviews/${name}`, {
            method: 'PUT',
            body: JSON.stringify({
                action: 'refresh'
            })
        }).then(res => {
            console.log(res)
            loadReviews()
        })
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
  }
</style>