import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  TouchableOpacity,
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
  const scrollX = new Animated.Value(0); // Used for animated transitions
  const intervalRef = React.useRef(null); // Reference to clear autoplay interval

  // Auto-play the carousel after 3 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (currentIndex < images.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      } else {
        setCurrentIndex(0); // Loop back to the first item
      }
    }, 3000);

    return () => {
      clearInterval(intervalRef.current); // Clean up the interval
    };
  }, [currentIndex]);

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
    console.log("cek scale", scale, index);

    return (
      <Animated.View style={[styles.item, { transform: [{ scale }] }]}>
        <Image source={{ uri: item.source }} style={styles.image} />
      </Animated.View>
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={styles.container}>
        <AnimatedFlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          scrollEventThrottle={16} // Smooth scrolling
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          contentContainerStyle={[styles.carousel]}
          style={{ width: width, borderWidth: 1, borderColor: "yellow" }}
          initialScrollIndex={currentIndex}
        />

        {/* Navigation buttons */}
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
  carousel: {
    alignItems: "flex-center",
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
    width: width / 2,
    // marginHorizontal: 10,
  },
  image: {
    width: width / 2, // Image width minus padding
    height: 250,
    borderRadius: 10,
    resizeMode: "cover",
  },
  buttons: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
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
