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

const { width, height } = Dimensions.get("window");

// Example images
const images = [
  {
    id: "1",
    source: "https://picsum.photos/600/400?random=1",
  },
  {
    id: "2",
    source: "https://picsum.photos/600/400?random=2",
  },
  {
    id: "3",
    source: "https://picsum.photos/600/400?random=3",
  },
  {
    id: "4",
    source: "https://picsum.photos/600/400?random=4",
  },
  {
    id: "5",
    source: "https://picsum.photos/600/400?random=5",
  },
  {
    id: "6",
    source: "https://picsum.photos/600/400?random=6",
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function Index() {
  const [currentIndex, setCurrentIndex] = useState(0); // Track current index for carousel
  const scrollX = useRef(new Animated.Value(0)).current; // Used for animated transitions
  const flatListRef = useRef(null); // Reference to the FlatList

  // Render individual carousel item
  const renderItem = ({ item, index }) => {
    const scale = scrollX.interpolate({
      inputRange: [
        ((index - 1) * width) / 2,
        (index * width) / 2,
        ((index + 1) * width) / 2,
      ],
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });

    return (
      <Animated.View style={[styles.item, { transform: [{ scale }] }]}>
        <Image source={{ uri: item.source }} style={styles.image} />
      </Animated.View>
    );
  };

  // Handle Next button click
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    flatListRef.current.scrollToIndex({ animated: true, index: nextIndex });

    // Manually update scrollX after scrolling
    Animated.spring(scrollX, {
      toValue: (nextIndex * width) / 2, // Set scrollX to the correct position
      useNativeDriver: true,
    }).start();
  };

  // Handle Prev button click
  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    flatListRef.current.scrollToIndex({ animated: true, index: prevIndex });

    // Manually update scrollX after scrolling
    Animated.spring(scrollX, {
      toValue: (prevIndex * width) / 2, // Set scrollX to the correct position
      useNativeDriver: true,
    }).start();
  };

  // Handle scroll event to update the index
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false } // Not using native driver because we want to update the index
  );

  // // Update the current index when scrolling
  // useEffect(() => {
  //   const listener = scrollX.addListener(({ value }) => {
  //     const newIndex = Math.floor(value / width);
  //     if (newIndex !== currentIndex) {
  //       setCurrentIndex(newIndex);
  //     }
  //   });

  //   // Cleanup listener when the component unmounts
  //   return () => {
  //     scrollX.removeListener(listener);
  //   };
  // }, [scrollX, currentIndex]);

  console.log("cek ya", currentIndex);

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
          scrollEventThrottle={16} // Smooth scrolling
          contentContainerStyle={styles.carousel}
          initialScrollIndex={currentIndex}
          snapToInterval={width / 2} // Snap to each item
          decelerationRate="fast"
        />

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
    width: width / 2,
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
});
