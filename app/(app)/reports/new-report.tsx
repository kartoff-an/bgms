import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, TextInput, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";

import { useThemeColor } from "@app/hooks/use-theme-color";
import { ThemedScreenWrapper, ThemedView, ThemedText, ThemedButton } from "@app/components/ui";
import { StepIndicator } from "@app/components/reports/step-indicator";
import { ReportTypeSelector } from "@app/components/reports/report-type-selector";
import { GeositeSearch } from "@app/components/reports/geosite-search";
import { DamageTypeSelector } from "@app/components/reports/damage-type-selector";
import { MediaPicker } from "@app/components/media/media-picker";
import { LocationPicker } from "@app/components/map/location-picker";
import { ErrorDisplay } from "@app/components/error-display";

import { ReportType } from "@app/types/report";
import { DamageType } from "@app/types/damage-type";
import { Geosite } from "@app/types/geosite";
import { damageTypeService } from "@app/services/damage-type.service";
import { monitoringReportService } from "@app/services/report.service";
import { getPresignedUrl } from "@app/services/s3.service";
import { uploadFileToS3 } from "@app/services/s3-uploader.service";

interface MediaItem {
    uri: string;
    type: "image" | "video";
}

interface FormValues {
    reportType: ReportType | null;
    damageType: DamageType | null;
    damageDescription: string;
    latitude: number | null;
    longitude: number | null;
    images: MediaItem[];
    geosite: Geosite | null;
}

export default function NewReportPage() {
    const theme = useThemeColor();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [damageTypes, setDamageTypes] = useState<DamageType[]>([]);
    const [loadingDamageTypes, setLoadingDamageTypes] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        trigger,
        clearErrors,
    } = useForm<FormValues>({
        defaultValues: {
            reportType: null,
            damageType: null,
            damageDescription: "",
            latitude: null,
            longitude: null,
            images: [],
            geosite: null,
        },
    });

    const formValues = watch();

    useEffect(() => {
        loadDamageTypes();
    }, []);

    const loadDamageTypes = async () => {
        try {
            const types = await damageTypeService.getAll();
            setDamageTypes(types);
        } catch (error) {
            console.error("Failed to load damage types", error);
        } finally {
            setLoadingDamageTypes(false);
        }
    };

    const validateStep = async (): Promise<boolean> => {
        if (step === 1) {
            const isValid = await trigger("reportType");
            return isValid;
        }
        if (step === 2) {
            const isValid = await trigger(["damageType", "damageDescription", "geosite", "latitude", "longitude"]);
            return isValid;
        }
        if (step === 3) {
            const isValid = await trigger("images");
            return isValid;
        }
        return true;
    };

    const handleNext = async () => {
        const isValid = await validateStep();
        if (isValid) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const uploadedImageUrls: string[] = [];
            for (const media of data.images) {
                const fileName = `reports/${Date.now()}-${Math.random()}.jpg`;
                const contentType = "image/jpeg";
                const presigned = await getPresignedUrl(fileName, contentType);
                await uploadFileToS3(presigned.uploadUrl, media.uri, contentType);
                uploadedImageUrls.push(presigned.fileUrl);
            }

            await monitoringReportService.create({
                damageTypeName: data.damageType!.name,
                damageDescription: data.damageDescription,
                reportType: data.reportType!,
                latitude: data.latitude!,
                longitude: data.longitude!,
                medias: uploadedImageUrls,
                geositeId: data.geosite!.id,
            });

            Alert.alert("Success", "Report submitted successfully", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert("Upload Failed", "Could not upload report");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <Controller
                        control={control}
                        name="reportType"
                        rules={{ required: "Report type is required" }}
                        render={({ field: { onChange, value } }) => (
                            <ReportTypeSelector
                                selectedType={value}
                                onSelect={(type) => {
                                    onChange(type);
                                    clearErrors("reportType");
                                }}
                                error={errors.reportType?.message}
                            />
                        )}
                    />
                );
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Controller
                            control={control}
                            name="geosite"
                            rules={{ required: "Geosite is required" }}
                            render={({ field: { onChange, value } }) => (
                                <GeositeSearch
                                    selectedGeosite={value}
                                    onSelect={(geosite) => {
                                        onChange(geosite);
                                        if (geosite.latitude && geosite.longitude) {
                                            setValue("latitude", geosite.latitude);
                                            setValue("longitude", geosite.longitude);
                                            clearErrors(["geosite", "latitude", "longitude"]);
                                        }
                                    }}
                                    onClear={() => {
                                        onChange(null);
                                        setValue("latitude", null);
                                        setValue("longitude", null);
                                        clearErrors(["geosite", "latitude", "longitude"]);
                                    }}
                                    error={errors.geosite?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="damageType"
                            rules={{ required: "Damage type is required" }}
                            render={({ field: { onChange, value } }) => (
                                <DamageTypeSelector
                                    damageTypes={damageTypes}
                                    selectedType={value}
                                    onSelect={(type) => {
                                        onChange(type);
                                        clearErrors("damageType");
                                    }}
                                    loading={loadingDamageTypes}
                                    error={errors.damageType?.message}
                                />
                            )}
                        />

                        <View style={styles.field}>
                            <ThemedText variant="primary" weight="semibold" size="md">
                                Description
                            </ThemedText>
                            <Controller
                                control={control}
                                name="damageDescription"
                                rules={{ required: "Description is required" }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <TextInput
                                            style={[
                                                styles.textArea,
                                                {
                                                    backgroundColor: theme.inputBackground,
                                                    color: theme.textPrimary,
                                                    borderColor: theme.border,
                                                    borderWidth: 1,
                                                },
                                            ]}
                                            placeholder="Describe the damage or issue..."
                                            placeholderTextColor={theme.placeholder}
                                            multiline
                                            numberOfLines={4}
                                            value={value}
                                            onChangeText={(text) => {
                                                onChange(text);
                                                clearErrors("damageDescription");
                                            }}
                                        />
                                        {errors.damageDescription && (
                                            <ErrorDisplay message={errors.damageDescription.message} />
                                        )}
                                    </>
                                )}
                            />
                        </View>

                        <Controller
                            control={control}
                            name="latitude"
                            rules={{
                                required: "Location must be selected on the map",
                                validate: (value) => value !== null || "Location is required",
                            }}
                            render={({ field: { onChange, value } }) => (
                                <>
                                    <LocationPicker
                                        latitude={formValues.latitude}
                                        longitude={formValues.longitude}
                                        onLocationSelect={(lat, lng) => {
                                            setValue("latitude", lat);
                                            setValue("longitude", lng);
                                            clearErrors(["latitude", "longitude"]);
                                        }}
                                        error={errors.latitude?.message || errors.longitude?.message}
                                    />
                                    {(errors.latitude || errors.longitude) && (
                                        <ErrorDisplay message={errors.latitude?.message || errors.longitude?.message || "Location is required"} />
                                    )}
                                </>
                            )}
                        />
                    </View>
                );
            case 3:
                return (
                    <Controller
                        control={control}
                        name="images"
                        rules={{ required: "At least one image is required" }}
                        render={({ field: { onChange, value } }) => (
                            <>
                                <MediaPicker
                                    media={value}
                                    onAddMedia={(media) => {
                                        onChange(media);
                                        clearErrors("images");
                                    }}
                                    onRemoveMedia={(index) => {
                                        const updated = [...value];
                                        updated.splice(index, 1);
                                        onChange(updated);
                                        if (updated.length === 0) {
                                            trigger("images");
                                        }
                                    }}
                                    error={errors.images?.message}
                                />
                                {errors.images && <ErrorDisplay message={errors.images.message} />}
                            </>
                        )}
                    />
                );
            default:
                return null;
        }
    };

    const data = [{ key: "content" }];

    return (
        <ThemedScreenWrapper>
            <ThemedView variant="default" style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={handleBack}>
                        <Ionicons name="chevron-back" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <ThemedText
                        variant="primary"
                        weight="bold"
                        size="lg"
                        style={styles.headerTitle}
                    >
                        New Report
                    </ThemedText>
                    <View style={{ width: 24 }} />
                </View>

                <FlatList
                    data={data}
                    keyExtractor={() => "content"}
                    renderItem={() => (
                        <>
                            <StepIndicator currentStep={step} totalSteps={3} />
                            {renderStepContent()}
                        </>
                    )}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                />

                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    {step < 3 ? (
                        <ThemedButton
                            title="Next"
                            variant="primary"
                            size="lg"
                            onPress={handleNext}
                            fullWidth
                            disabled={isSubmitting}
                        />
                    ) : (
                        <ThemedButton
                            title={isSubmitting ? "Submitting..." : "Submit Report"}
                            variant="primary"
                            size="lg"
                            onPress={handleSubmit(onSubmit)}
                            fullWidth
                            disabled={isSubmitting}
                        />
                    )}
                </View>
            </ThemedView>
        </ThemedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    stepContainer: {
        gap: 20,
    },
    field: {
        gap: 8,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        minHeight: 100,
        textAlignVertical: "top",
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
});