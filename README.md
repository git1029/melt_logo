### Usage

```jsx
import LogoAnimation from './components/LogoAnimation'

const App = () => {
  return <LogoAnimation controls />
}
```

### Props

<table>
  <tr>
    <th valign="top">
    Prop
    </th>
    <th valign="top">
    Description 
    </th>
    <th valign="top">
    Default 
    </th>
  </tr>
  <tr>
    <td valign="top">
    controls
    </td>
    <td valign="top">
    Toggles Leva control panel and perf-r3f metrics
    </td>
    <td valign="top"><code>true</code></td>
  <tr>
</table>

### Config

```js
{
  "logoSettings": {
    "displacement": {
      "strength": 1,
      "radius": 1,
      "decay": 0.5,
      "noise": 1,
      "colorShift": 1,
      "frequency": 1,
      "amplitude": 0.2
    },
    "refraction": {
      "refractionRatio": 17,
      "mouseSpeed": 20,
      "rotAngle": {
        "x": 90,
        "y": 50,
        "z": 145
      },
      "rotSpeed": {
        "x": -9,
        "y": -3,
        "z": 3
      }
    }
  }
}

```

### Dependencies

<ul>
  <li><a href="https://github.com/facebook/react">react</a></li>
  <li><a href="https://github.com/mrdoob/three.js/">three</a></li>
  <li><a href="https://github.com/pmndrs/react-three-fiber">@react-three/fiber</a></li>
  <li><a href="https://github.com/pmndrs/drei">@react-three/drei</a></li>
  <li><a href="https://github.com/pmndrs/leva">leva</a></li>
  <li><a href="https://github.com/utsuboco/r3f-perf">r3f-perf</a></li>
</ul>
