import { View } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const CARD_WIDTH = 260;
const SPACING = 16;

export function GeositeSkeletonItem() {
    return (
        <View style={{ marginHorizontal: SPACING / 2 }}>
            <SkeletonPlaceholder
                borderRadius={12}
                backgroundColor="#ffffff"
            >
                <SkeletonPlaceholder.Item
                    width={CARD_WIDTH}
                    height={140}
                    borderRadius={12}
                    backgroundColor="#ffffff"
                >
                    {/* Overlay content */}
                    <SkeletonPlaceholder.Item
                        position="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                        padding={12}
                        backgroundColor="#ffffff"
                    >
                        {/* Name */}
                        <SkeletonPlaceholder.Item
                            width="75%"
                            height={12}
                            borderRadius={6}
                        />

                        {/* Municipality badge */}
                        <SkeletonPlaceholder.Item
                            flexDirection="row"
                            alignItems="center"
                            marginTop={8}
                            backgroundColor="#ffffff"
                        >
                            <SkeletonPlaceholder.Item
                                width={12}
                                height={12}
                                borderRadius={6}
                            />
                            <SkeletonPlaceholder.Item
                                width={70}
                                height={10}
                                borderRadius={6}
                                marginLeft={6}
                            />
                        </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder>
        </View>
    );
}