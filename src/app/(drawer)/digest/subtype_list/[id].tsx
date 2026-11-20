import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  Divider,
  Icon,
  Text,
  useTheme,
} from "react-native-paper";

import { lawyer_ci_url } from "@/config/apiUrls";
import { Brand, Fonts } from "@/constants/theme";
import { decode } from "html-entities";

export interface CaseItem {
  id: number;
  title: string;
  division: string;
  case_no: string;
  judge: string;
  advocate: string;
  citation: string;
  case_year: number;
  appellant: string;
  respondent: string;
  subject: string;
  delivery_date: string;
  court: string;
  type: string;
  subtype: string;
}

export default function CaseList() {
  const theme = useTheme();
  const router = useRouter();

  const [digests, setDigests] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const source = axios.CancelToken.source();

    async function fetchdigests() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get<any>(`${lawyer_ci_url}digests_json/` + id, {
          cancelToken: source.token,
        });
        setDigests(res.data.data.digest_list);
        console.log(digests[0]);
      } catch (err: any) {
        if (!axios.isCancel(err)) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load cases",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchdigests();

    return () => {
      source.cancel("Component unmounted");
    };
  }, [id]);

  const renderDigestCard = ({ item }: { item: any }) => {
    return (
      <Card
        mode="outlined"
        style={styles.card}
        onPress={() => router.push(`/digest/detail/${item.slug}` as any)}
      >
        <Card.Content style={styles.cardContent}>
          {/* Header Badges */}
          <View style={styles.chipRow}>
            {item.court ? (
              <Chip icon="bank" compact style={styles.chip}>
                {decode(item.court)}
              </Chip>
            ) : null}

            {item.case_year ? (
              <Chip icon="calendar" compact style={styles.chip}>
                {decode(item.case_year)}
              </Chip>
            ) : null}
          </View>

          {/* Title & Case Number */}
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {decode(item.title)}
          </Text>

          <Text
            variant="labelLarge"
            style={{ color: theme.colors.primary, marginBottom: 8 }}
          >
            {decode(item.case_no)}
          </Text>

          <Divider style={styles.divider} />

          {/* Detailed Legal Info Box Content */}
          <View style={styles.metaContainer}>
            {/* Litigants Row */}
            <View style={styles.metaRow}>
              <Icon
                source="account-group"
                size={16}
                color={theme.colors.outline}
              />
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.outline, flex: 1 }}
              >
                <Text style={{ fontWeight: "600" }}>Appellant(s): </Text>
                {decode(item.appellant)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Icon
                source="account-group"
                size={16}
                color={theme.colors.outline}
              />
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.outline, flex: 1 }}
              >
                <Text style={{ fontWeight: "600" }}>Respondents(s): </Text>
                {decode(item.respondent)}
              </Text>
            </View>

            {/* Bench & Division Row */}
            <View style={styles.metaRow}>
              <Icon
                source="scale-balance"
                size={16}
                color={theme.colors.outline}
              />
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.outline, flex: 1 }}
              >
                <Text style={{ fontWeight: "600" }}>Relevant Laws: </Text>
                {decode(item.relevant_law) || "N/A"} |{" "}
                <Text style={{ fontWeight: "600" }}>Relevant Sections: </Text>
                {decode(item.relevant_section) || "N/A"}
              </Text>
            </View>

            {/* Citation Row */}
            {item.citation ? (
              <View style={styles.metaRow}>
                <Icon
                  source="file-document-outline"
                  size={16}
                  color={theme.colors.outline}
                />
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.outline, flex: 1 }}
                >
                  <Text style={{ fontWeight: "600" }}>Citation: </Text>
                  {decode(item.citation)}
                </Text>
              </View>
            ) : null}
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator animating={true} size="large" />
        <Text variant="bodyMedium" style={styles.stateText}>
          Loading cases...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerState}>
        <Icon
          source="alert-circle-outline"
          size={48}
          color={theme.colors.error}
        />
        <Text
          variant="bodyMedium"
          style={[styles.stateText, { color: theme.colors.error }]}
        >
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Search Header */}

      {/* Case List (Boxes Container) */}
      <FlatList
        data={digests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDigestCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centerState}>
            <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
              No cases found.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.colors.surface,
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Brand.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
  },
  searchBar: {
    borderRadius: Brand.radius.medium,
    backgroundColor: Brand.colors.surface,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    borderRadius: Brand.radius.large,
    borderColor: Brand.colors.border,
    backgroundColor: Brand.colors.background,
  },
  cardContent: {
    paddingVertical: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    borderRadius: Brand.radius.medium,
    borderColor: Brand.colors.primary,
    backgroundColor: Brand.colors.background,
  },
  title: {
    fontWeight: "600",
    color: Brand.colors.ink,
    fontFamily: Fonts?.serif,
    marginBottom: 2,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: Brand.colors.border,
  },
  metaContainer: {
    gap: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: Brand.colors.surface,
  },
  stateText: {
    marginTop: 12,
    color: Brand.colors.muted,
  },
});
