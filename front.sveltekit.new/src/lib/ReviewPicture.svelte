<script lang="ts">
    import ThumbsUp from '$lib/svgs/thumbs-up.svg?url';
    import ThumbsUpFilled from '$lib/svgs/thumbs-up--filled.svg?url';
    import ThumbsDown from '$lib/svgs/thumbs-down.svg?url';
    import ThumbsDownFilled from '$lib/svgs/thumbs-down--filled.svg?url'
    import Send from '$lib/svgs/send.svg?url';

    export let picture;
    export let review;

    const pictureFname = picture.path.split('/').at(-1);
    const src = `/api/review-pictures/${review.name}/${pictureFname}`;

    let comment = picture.comment;

    async function setStatus(status) {
        picture.status = status;
        console.log(picture.status);
        console.log(src)

        const response = await fetch(src, {
            method: 'PUT',
            body: JSON.stringify({
                action: 'setStatus',
                value: picture.status,
            })
        });
    }

    async function setComment() {
        picture.comment = comment;

        const response = await fetch(src, {
            method: 'PUT',
            body: JSON.stringify({
                action: 'setComment',
                value: picture.comment,
            })
        });
    }

</script>

<main>
    <img {src}>
    <div id="controls">
        <div id="thumbs">

            {#if picture.status === -1}
                <button on:click={() => setStatus(0)}><img src={ThumbsDownFilled} alt=""></button>
                <button on:click={() => setStatus(1)}><img src={ThumbsUp} alt=""></button>
            {/if}
            {#if picture.status === 0}
                <button on:click={() => setStatus(-1)}><img src={ThumbsDown} alt=""></button>
                <button on:click={() => setStatus(1)}><img src={ThumbsUp} alt=""></button>
            {/if}
            {#if picture.status === 1}
                <button on:click={() => setStatus(-1)}><img src={ThumbsDown} alt=""></button>
                <button on:click={() => setStatus(0)}><img src={ThumbsUpFilled} alt=""></button>
            {/if}

        </div>
        <div id="comment">
            <textarea cols="50" rows="2" bind:value={comment} placeholder="Commentaire..."></textarea>
            <button on:click={() => setComment()}><img src={Send} alt=""></button>
        </div>
    </div>
</main>

<style lang="scss">
  @import "$src/color.scss";
  @import "$src/fonts.scss";

  main {
    border-radius: 10px;
    background-color: white;
    box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.2);

    img {
      max-height: 100%;
      max-width: 100%;
      min-height: 100px;
    }

    #controls {
      height: 100px;
      display: flex;
      justify-content: space-between;

      #thumbs {
        button {
          border: none;
          outline: none;
          background: none;

          &:hover {
            cursor: pointer;
          }

          img {
            width: 50px;
          }
        }
      }

      #comment {
        display: flex;
        justify-content: center;

        button {
          height: 20px;
          border: none;
          outline: none;
          background: none;

          &:hover {
            cursor: pointer;
          }

          img {
            width: 20px;
          }
        }

        textarea {
          height: 80%;
          resize: none;
        }
      }
    }
  }
</style>