<div id="title">EVRARD VAN ESPEN</div>
<div id="subtitle">Photographie</div>

<style lang="scss">
  @import "$src/color.scss";
  @import "$src/fonts.scss";

  #title {
    @include f-h;
    color: $subcolor;
    opacity: .1;
    z-index: 1000000;
    font-size: 6em;
    position: fixed;
    bottom: 0;
    left: 6vw;
    transform: rotate(-90deg);
    transform-origin: bottom left;
    width: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
  }

  #subtitle {
    @include f-h;
    font-size: 4em;
    color: $subcolor;
    opacity: .1;
    z-index: 1000000;
    font-size: 4em;
    position: fixed;
    top: 50vh;
    right: -22vw;
    transform: rotate(90deg);
    width: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>
