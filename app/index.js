import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  FlatList,
} from "react-native";
import images from "./utils/images";

const { width, height } = Dimensions.get("window");

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Index() {
  const [currentIndex, setCurrentIndex] = useState(0); // Track current index for carousel
  const scrollX = useRef(new Animated.Value(0)).current; // Used for animated transitions
  const flatListRef = useRef(null); // Reference to the FlatList

  // State to control the visibility of the overlay
  const [overlayVisible, setOverlayVisible] = useState(false);

  // Animated values for the overlay animation
  const overlayAnim = useState(new Animated.Value(0))[0]; // Starting at 0 (not visible)

  // Function to toggle the overlay visibility and animate
  const toggleOverlay = () => {
    setOverlayVisible(true);

    // Animate the overlay to expand and cover the entire screen
    Animated.timing(overlayAnim, {
      toValue: 1,
      duration: 500, // Duration of the animation
      useNativeDriver: true,
    }).start();
  };

  // Function to hide the overlay with a reverse animation
  const hideOverlay = () => {
    Animated.timing(overlayAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setOverlayVisible(false)); // Hide the overlay after animation
  };

  // Render individual carousel item
  const renderItem = ({ item, index }) => {
    const scale = scrollX.interpolate({
      inputRange: [
        ((index - 1) * width) / 2,
        (index * width) / 2,
        ((index + 1) * width) / 2,
      ],
      outputRange: [0.75, 1, 0.75],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        disabled={index !== currentIndex}
        style={[
          styles.item,
          {
            transform: [{ scale }],
            paddingLeft: index === 0 ? width / 2 : width / 4,
            paddingRight: index === images.length - 1 ? width / 2 : width / 4,
            width: width / 4,
          },
        ]}
      >
        <AnimatedTouchable onPress={() => toggleOverlay()} style={styles.item}>
          <Image source={{ uri: item.source }} style={styles.image} />
        </AnimatedTouchable>
      </Animated.View>
    );
  };

  // Handle Next button click
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    // setCurrentIndex(nextIndex);
    flatListRef.current.scrollToIndex({
      animated: true,
      index: nextIndex,
      viewPosition: 0.5,
    });

    // Manually update scrollX after scrolling
    Animated.spring(scrollX, {
      toValue: (nextIndex * width) / 2, // Set scrollX to the correct position
      useNativeDriver: true,
      viewPosition: 0.5,
    }).start();
  };

  // Handle Prev button click
  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    // setCurrentIndex(prevIndex);
    flatListRef.current.scrollToIndex({
      animated: true,
      index: prevIndex,
      viewPosition: 0.5,
    });

    // Manually update scrollX after scrolling
    Animated.spring(scrollX, {
      toValue: (prevIndex * width) / 2, // Set scrollX to the correct position
      useNativeDriver: true,
      // viewPosition: 0.5,
    }).start();
  };

  // Handle scroll event to update the index
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false } // Not using native driver because we want to update the index
  );

  // Update the current index when scrolling
  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const newIndex = Math.round((value / width) * 2);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    });

    // Cleanup listener when the component unmounts
    return () => {
      scrollX.removeListener(listener);
    };
  }, [scrollX, currentIndex]);

  return (
    <View style={styles.container}>
      <View style={styles.carouselContainer}>
        <AnimatedFlatList
          ref={flatListRef}
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          // scrollEnabled={false} // Disable default scrolling behavior
          onScroll={handleScroll} // Track scrolling
          contentContainerStyle={styles.carousel}
          initialScrollIndex={currentIndex}
          scrollEventThrottle={16} // Smooth scrolling
          snapToInterval={width / 2} // Snap to each item
          decelerationRate={"fast"}
        />

        {/* The overlay */}
        {overlayVisible && (
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayAnim,
                transform: [
                  {
                    scale: overlayAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1], // Grow from 0 to 1
                    }),
                  },
                ],
                padding: 16,
              },
            ]}
          >
            <Animated.View
              style={[styles.overlayClose, { marginLeft: 16, marginRight: 16 }]}
            >
              <Image
                source={{ uri: images[currentIndex].source }}
                style={
                  (styles.image,
                  {
                    width: width - 128,
                    height: width - 128,
                  })
                }
              />

              <View
                style={{
                  justifyContent: "flex-start",
                  alignItems: "flex-end",
                  marginTop: 32,
                }}
              >
                <TouchableOpacity
                  style={[styles.button, { marginLeft: 8 }]}
                  onPress={hideOverlay}
                >
                  <Text style={styles.overlayText}>Close Overlay</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        )}

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={handlePrev}>
            <Text style={styles.buttonText}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  carousel: {
    alignItems: "center",
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
    // width: width / 2,
  },
  image: {
    width: width / 2,
    height: 250,
    borderRadius: 10,
    resizeMode: "cover",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
    width: width - 40,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  overlayClose: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  overlayText: {
    fontSize: 18,
    color: "#FFFFFF",
  },
});
