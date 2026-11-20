import Articles from "@/components/Articles";
import BookAuthors from "@/components/BookAuthors";
import ImageCarousel from "@/components/Carousel";
import Cases from "@/components/Cases";
import ClientFeedback from "@/components/ClientFeedback";
import ConventionTypes from "@/components/ConventionTypes";
import CourseTypes from "@/components/CourseTypes";
import Docs from "@/components/Docs";
import LatestArticles from "@/components/LatestArticles";
import LegalCourses from "@/components/LegalCourses";
import MembersOf from "@/components/MembersOf";
import OurServices from "@/components/OurServices";
import RecentVideos from "@/components/RecentVideos";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

function HomeScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.main}
      showsVerticalScrollIndicator={false}
    >
      <ImageCarousel />
      <Cases />
      <Docs />
      <CourseTypes />
      <ConventionTypes />
      <BookAuthors />
      <LegalCourses />
      <OurServices />
      <MembersOf />
      <Articles />
      <ClientFeedback />
      <RecentVideos />
      <LatestArticles />
    </ScrollView>
  );
}

export default React.memo(HomeScreen);

const styles = StyleSheet.create({
  main: {
    alignItems: "center",
    gap: 40,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});
