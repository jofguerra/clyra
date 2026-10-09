These transparent PNGs are renders of the corresponding original Illustrator/PDF artboards in `Animations and Assets/Heart Mascot/`.

The cropped part PNGs have different canvas sizes. Stacking them at the same size distorted the faces and limbs. Rendering the complete artboard preserves the original artwork and positions without redesigning the mascot.

To regenerate a pose with Poppler:

```sh
pdftocairo -png -transp -singlefile -scale-to 600 \
  'Animations and Assets/Heart Mascot/Doctor/Doctor.ai' assets/mascot/doctor
```
