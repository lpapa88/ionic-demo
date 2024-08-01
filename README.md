## Ionic demo app

A demo app to demostrate slow back button transition on IOS while you navigate to the previous page.

## Build

```sh
npm install
ionic build
ionic cap run ios -l --external
```

## Test

Open the app, click on on click me card. On the next page click the back button and notice the slow header fadeout transition.