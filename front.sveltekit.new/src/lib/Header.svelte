<script>
  import { page } from '$app/stores'

  let routes = {
    '/galerie': 'Galerie',
    '/animalier': 'Animalier',
    '/albums': 'Albums',
    // '/prestations': 'Prestations',
    // '/apropos': 'A Propos'
  }
</script>

<main id="header">
  {#if $page.url.pathname != '/'}
    <a id="home-link" class="link" href="/">Accueil</a>
  {:else}
    <div></div>
  {/if}
  <div id="links">
    {#each Object.keys(routes) as href}
      <a class:active={$page.url.pathname.includes(href)} class="link" {href}>{routes[href]}</a>
    {/each}
  </div>
</main>

<style lang="scss">
  @import "$src/fonts.scss";
  @import "$src/color.scss";

  #header {
    position: fixed;
    top: 0;
    left: 0;
    width: 98%;
    height: 5vh;
    font-size: 2em;
    border-bottom: 1px solid $text;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 50px;
    background-color: $background;
    z-index: 100000;

    #home-link {
      margin-left: 1vw;
    }

    #links {
      width: 20%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .link {
      @include f-p;
      transition: .5s;
      text-decoration: none;
      color: $text;

      &:hover {
        font-weight: 800;
        cursor: pointer;
      }
    }
  }

  :global(.active) {
    font-style: oblique !important;
    font-weight: bolder !important;
  }
</style>
