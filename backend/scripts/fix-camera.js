const fs = require('fs');
let content = fs.readFileSync('frontend/app/tabs/camera.tsx', 'utf8');

// I seem to have duplicated the dropdown. 
// I will just replace the whole section starting from <Section id="photos"... until </Section> (3rd section)
const startMarker = '<Section id="photos"';
const endMarker = '</Section>';

const startIdx = content.indexOf(startMarker);
// Find the end of the third </Section> tag
let endIdx = content.indexOf(endMarker, startIdx); // Photo
endIdx = content.indexOf(endMarker, endIdx + 1); // Description
endIdx = content.indexOf(endMarker, endIdx + 1); // Standards

const fixedSection = `
          <Section id="photos" sectionOffsets={sectionOffsets} title="1. Photo Evidence" helper="Take or upload one or more photos. They will appear here for the user to verify before saving.">
            <View style={styles.photoButtonRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
                <Text style={styles.primaryButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={uploadPhoto}>
                <Text style={styles.secondaryButtonText}>Upload Photo</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
              {currentHazard.photos.map((uri) => (
                <View key={uri} style={styles.photoWrap}>
                  <Image source={{ uri }} style={styles.photo} />
                  <TouchableOpacity style={styles.photoDelete} onPress={() => removePhoto(uri)}>
                    <Text style={styles.photoDeleteText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </Section>

          <Section id="description" sectionOffsets={sectionOffsets} title="2. Hazard Description" helper="Select the closest hazard category, then describe what is unsafe, who is exposed, and what could happen.">
            <Text style={[styles.fieldLabel, { color: "#000000", fontWeight: "bold" }]}>Hazard Category</Text>
            <TouchableOpacity
              testID="hazard-category-dropdown"
              style={[styles.dropdownButton, { backgroundColor: "#FFFFFF", borderColor: "#D7DEE8", shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }]}
              onPress={() => setCategoryOpen((open) => !open)}
            >
              <Text style={[styles.dropdownText, { color: currentHazard.hazardCategory ? "#101828" : colors.muted }]}>
                {currentHazard.hazardCategory || "Select hazard category"}
              </Text>
              <Text style={styles.dropdownChevron}>{categoryOpen ? "⌃" : "⌄"}</Text>
            </TouchableOpacity>

            {categoryOpen && (
              <View style={[styles.dropdownMenu, { backgroundColor: "#FFFFFF", borderColor: "#D7DEE8", shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5, zIndex: 1000 }]}>
                <ScrollView style={{ maxHeight: 250 }}>
                  {hazardCategories.map((category) => (
                    <TouchableOpacity
                      testID={"hazard-category-option-" + category.replace(/[^a-z0-9]/gi, "-")}
                      key={category}
                      style={[styles.dropdownOption, { backgroundColor: currentHazard.hazardCategory === category ? "rgba(249,115,22,0.12)" : "#FFFFFF" }]}
                      onPress={() => { updateHazard({ hazardCategory: category }); setCategoryOpen(false); }}
                    >
                      <Text style={[styles.dropdownOptionText, { color: "#101828" }]}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            <TextInput
              style={[styles.textArea, { backgroundColor: "#FFFFFF", borderColor: "#D7DEE8", color: "#101828" }]}
              placeholder="Example: Damaged ladder with bent side rail being used near the maintenance area."
              placeholderTextColor={colors.muted}
              multiline
              value={currentHazard.hazardDescription}
              onChangeText={(hazardDescription) => updateHazard({ hazardDescription })}
            />
          </Section>
`;

content = content.substring(0, startIdx) + fixedSection + content.substring(endIdx);
fs.writeFileSync('frontend/app/tabs/camera.tsx', content);
