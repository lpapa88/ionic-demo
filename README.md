## Ionic demo app

Ionix demo app

## Build

```sh
npm install
ionic build
ionic cap run ios -l --external
```

## closing multiple modals issue

This is more a question to see what is the recommended way to handle multiple modals. On the video below we can see the following:


1. User clicks on go to modals page
2. On this page, we have an inline modal in order to create a bottom sheet to create a "floating" like button to hide the bottom tabs
3. User clicks on submit a second modal is shown. NOTE at this point the view has 2 modals (inline one and the second dynamic one).
4. User clicks confirm on the second modal and the following code runs:

```ts
    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') {
        // NOTE: the call to modalCtrl.dismiss() will close the dynamic modal but not the bottom sheet modal...,
        // What is the best way to handle this? shall we use @ViewChild on the inline
        // modal and close it explicitly as well?
        this.modalCtrl.dismiss();
        this.router.navigate(['/'], { replaceUrl: true });
    }
```
5. The call to `this.modalCtrl.dismiss();` will close the dynamic modal but not the inline one which will still be visible on the previous page after the call to `this.router.navigate`

Is this the intented behaviour or do we need to close the inline modal explicitly using @ViewChild to reference it or so. 
