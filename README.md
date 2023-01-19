## LogoAnimation

### Usage

```jsx
import LogoAnimation from './components/LogoAnimation'

const App = () => {
  return <LogoAnimation effectRef={effectRef} controls />
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
  <tr>
    <td valign="top">
    effectRef
    </td>
    <td valign="top">
    react ref to pass scroll events for transition effect
    </td>
    <td valign="top"></td>
  <tr>
</table>

### Config

```json
{
  "config": {
    "displacementStrength": 1,
    "displacementRadius": 1,
    "displacementDecay": 0.5,
    "colorNoise": 1,
    "colorShift": 1,
    "refractionRatio": 17,
    "mouseSpeed": 20,
    "mouseArea": 0.1,
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
```

---

## WaterfallAnimation

### Usage

```jsx
import WaterfallAnimation from './components/WaterfallAnimation'

const App = () => {
  return <WaterfallAnimation controls />
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

```json
{
  "config": {
    "lineCount": 20,
    "lineSpeed": 1,
    "lineWidth": 0.5,
    "lineDistortion": 0.5,
    "lineColor": "#ffffff",
    "colorShift": 0.5,
    "imageStrength": 0.5,
    "mouseEnabled": true,
    "mouseStrength": 1
  }
}
```

---

### Dependencies

<ul>
  <li><a href="https://github.com/facebook/react">react</a></li>
  <li><a href="https://github.com/mrdoob/three.js/">three</a></li>
  <li><a href="https://github.com/pmndrs/react-three-fiber">@react-three/fiber</a></li>
  <li><a href="https://github.com/pmndrs/drei">@react-three/drei</a></li>
  <li><a href="https://github.com/pmndrs/leva">leva</a></li>
  <li><a href="https://github.com/utsuboco/r3f-perf">r3f-perf</a></li>
</ul>
