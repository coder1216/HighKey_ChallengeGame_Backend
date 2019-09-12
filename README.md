# Populic mobile

The mobile version of Populic is based on React Native (RN from now on) and will be published on iOS.

## Getting Started

If you are setting up a development environment, always follow the instructions on RN's documentation:
https://facebook.github.io/react-native/docs/getting-started.html

Besides the things mentioned in RN documentation you need to be familiar with npm or yarn and install the project dependencies.


## Project structure

React Native is opinionated with some things, like using */android* and */ios* folders for all native code. The JavaScript entry points are *index.android.js* and *index.ios.js* in the root, but other than that the JS files can be wherever.

Here, all JavaScript can be found in the */src* folder. I suggest starting from the top and taking a look at the index files, so you'll be familiar with the big picture first.

*actions, reducers* - Redux

*config* - router settings and global variables

*modules* - JavaScript modules

*native-components* - All React Native components

*views* - Views, which are top-level components used with navigation


## Linting and code format

The project uses AirBNB's ESLint guide for enforcing coding practices and Prettier for enforcing a certain code format.

At the moment a local ESLint installation (local to the project that is) is not working reliably in Windows, so for the time being use only Prettier to style your code.

You can run

```
npm run prettier
```

to see what should be fixed, and

```
npm run prettier-write
```

to have Prettier fix those issues for you.

**NOTE: You HAVE to commit before running prettier-write**, since it's not a 100% reliable process. The Prettier project also recommends it.

But the point is: do not worry about code style, let Prettier handle it.

##UI
Project uses https://shoutem.github.io/ library for it's UI components.

## Contributing

Create new branch first and commit your changes to it.
After feature is done, branch will be merged.

Never commit straight to master branch 

## Troubleshooting

### Error installing packeges

Make sure that npm is correct version


### Npm doesn't install 

If npm doesn't install, delete packege-lock.json

### Android

If your development build fails for an unknown reason, try to clean the project. Go to _/android_ and run

```
./gradlew clean
```

If you are adding new dependencies that use native code, you need to link the native properties as well. Most modules should have documentation for manual installation, but always try automatically first with

```
react-native link
```

### iOS
 - XCode dependencies and libraries
 - iOS versions
 -
