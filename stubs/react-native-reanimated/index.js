// No-op stub — no native build required
const React = require('react');
const { View, Text, Image, ScrollView, FlatList } = require('react-native');

const noop = () => {};
const identity = (v) => v;
const makeShared = (v) => ({ value: v });

// Wraps a RN component and strips reanimated-specific props before rendering
function makeAnimatedComponent(Component) {
  function AnimatedStub({ entering, exiting, layout, animatedProps, ...rest }) {
    return React.createElement(Component, rest);
  }
  AnimatedStub.displayName = `Animated(${Component.displayName || Component.name || 'Component'})`;
  return AnimatedStub;
}

const AnimatedView = makeAnimatedComponent(View);
const AnimatedText = makeAnimatedComponent(Text);
const AnimatedImage = makeAnimatedComponent(Image);
const AnimatedScrollView = makeAnimatedComponent(ScrollView);
const AnimatedFlatList = makeAnimatedComponent(FlatList);

function makeAnimationBuilder() {
  const builder = {
    duration: () => builder,
    delay: () => builder,
    springify: () => builder,
    damping: () => builder,
    stiffness: () => builder,
    withInitialValues: () => builder,
    easing: () => builder,
    rotate: () => builder,
    reduceMotion: () => builder,
    build: () => noop,
  };
  return builder;
}

const AnimatedNamespace = {
  View: AnimatedView,
  Text: AnimatedText,
  Image: AnimatedImage,
  ScrollView: AnimatedScrollView,
  FlatList: AnimatedFlatList,
  createAnimatedComponent: makeAnimatedComponent,
};

module.exports = {
  __esModule: true,
  default: AnimatedNamespace,
  Animated: AnimatedNamespace,
  useSharedValue: makeShared,
  useAnimatedStyle: (fn) => { try { return fn() ?? {}; } catch { return {}; } },
  useAnimatedProps: (fn) => { try { return fn() ?? {}; } catch { return {}; } },
  useAnimatedRef: () => ({ current: null }),
  useAnimatedScrollHandler: () => noop,
  useDerivedValue: (fn) => { try { return { value: fn() }; } catch { return { value: undefined }; } },
  useAnimatedReaction: noop,
  useFrameCallback: noop,
  makeMutable: makeShared,
  withTiming: (toValue) => toValue,
  withSpring: (toValue) => toValue,
  withDelay: (_delay, anim) => anim,
  withRepeat: (anim) => anim,
  withSequence: (...anims) => anims[anims.length - 1],
  withDecay: (config) => config?.velocity ?? 0,
  cancelAnimation: noop,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  interpolate: (_val, _in, out) => out[0] ?? 0,
  interpolateColor: (_val, _in, out) => out[0] ?? '#000000',
  Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  Easing: {
    linear: identity,
    ease: identity,
    quad: identity,
    cubic: identity,
    bezier: () => identity,
    in: identity,
    out: identity,
    inOut: identity,
  },
  createAnimatedComponent: makeAnimatedComponent,
  setUpTests: noop,
  enableLayoutAnimations: noop,
  ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
  // Entry/exit animation builders — chainable no-ops
  FadeIn: makeAnimationBuilder(),
  FadeOut: makeAnimationBuilder(),
  FadeInUp: makeAnimationBuilder(),
  FadeOutDown: makeAnimationBuilder(),
  SlideInDown: makeAnimationBuilder(),
  SlideOutDown: makeAnimationBuilder(),
  ZoomIn: makeAnimationBuilder(),
  ZoomOut: makeAnimationBuilder(),
  Layout: makeAnimationBuilder(),
};
