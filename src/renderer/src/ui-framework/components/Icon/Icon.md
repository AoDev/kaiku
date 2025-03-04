## Color

**color**: set any color for the icon

`<Icon color="SteelBlue" name="alert"/>`

### Size

**size**: same width and height

`<Icon size={64} name="alert"/>`

**width** & **height**:

`<Icon width={64} height={16} name="alert"/>`

### Position

- **top**: offsets the icon vertically
- **left**: offsets the icon horizontally

note: position: relative is set on the icon.

```jsx
<div>
  <Icon name="alert" top={8} /> <span>Icon aligned with text using offset</span>
</div>
```

### Background

- **bgColor**: the icon gets a background color.
- **bgPadding**: A padding is created between the icon and its wrapper. (Icon size is affected)
- **bgCircle**: The icon background becomes a circle.

```
<Icon name="alert" bgCircle bgColor="lightblue" bgPadding={8}/>
```
