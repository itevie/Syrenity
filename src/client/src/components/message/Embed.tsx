import Column from "../../dawn-ui/components/Column";
import Container from "../../dawn-ui/components/Container";
import Row from "../../dawn-ui/components/Row";
import Words, { TextType } from "../../dawn-ui/components/Words";

export default function Embed() {
  return (
    <Container
      small
      style={{
        padding: "15px",
        borderLeftColor: "red",
        borderLeftStyle: "solid",
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        maxWidth: "500px",
        minWidth: "200px",
        width: "fit-content !important",
      }}
    >
      <Column util={["small-gap"]}>
        <Words type={TextType.Heading}>%title%</Words>
        <Words>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
          consectetur est ut dapibus molestie. Praesent eu justo mi. Curabitur
          luctus et sem quis dignissim. Curabitur bibendum nibh est, sit amet
          ornare risus finibus eget. Integer vel quam est. Proin eros diam,
          vehicula sit amet gravida nec, congue placerat justo. Nulla gravida at
          velit a aliquam. Sed consectetur lorem eu turpis dictum, nec dignissim
          nunc mattis. Integer dictum nisl eget ligula porta porttitor. Duis
          dignissim blandit sem quis scelerisque. In sed consectetur enim, et
          volutpat leo. Nam pulvinar dui elit, eget aliquet diam blandit ut.
          Pellentesque nec semper odio, vel dictum nulla. Fusce a convallis
          odio. In eget sem eu mauris sodales maximus. Phasellus id leo quis
          massa porttitor pulvinar et a sem. In mi nibh, feugiat ut urna et,
          accumsan facilisis nibh. Sed vel mi massa. Aliquam nisl ligula,
          eleifend ac justo ac, lacinia aliquet massa. Duis at nibh rutrum,
          congue lorem vitae, elementum nisi. Mauris tempor sem ac fringilla
          maximus. Maecenas auctor iaculis purus, id ultrices ipsum ultrices
          eget. Donec blandit faucibus velit, eu imperdiet massa finibus ut.
          Donec fermentum nulla dolor, non sollicitudin ex sodales id. Donec
          ornare accumsan imperdiet. Nulla euismod velit eu erat rutrum, et
          laoreet ante imperdiet. Etiam tincidunt magna vel mauris auctor, at
          dapibus diam pellentesque. Quisque nibh quam, dignissim non enim at,
        </Words>
        <img src="https://imgs.search.brave.com/dD1_3deFbF40_CVfCDWOUjDNpSjUBZIM9jG1GgzzcsE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2RjLmdvdi9oZWFs/dGh5LXBldHMvbWVk/aWEvaW1hZ2VzL3Bl/dHMvcGlja2luZy11/cC1wb29wLmpwZw" />
        <Words type={TextType.Small}>This is the footer!</Words>
      </Column>
    </Container>
  );
}
