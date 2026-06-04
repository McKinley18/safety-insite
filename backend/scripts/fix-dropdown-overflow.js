const fs = require('fs');
let content = fs.readFileSync('frontend/app/tabs/camera.tsx', 'utf8');

const dropdownOpenBlock = ;

const replacement = `{categoryOpen && (
              <View style={[styles.dropdownMenu, { 
                maxHeight: 220,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#D7DEE8",
                backgroundColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 12,
                zIndex: 999,
                marginBottom: 16 
              }]}>
                <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true} style={{ maxHeight: 220 }}>
                  {hazardCategories.map((category) => (
                    <TouchableOpacity
                      testID={"hazard-category-option-" + category.replace(/[^a-z0-9]/gi, "-")}
                      key={category}
                      style={[styles.dropdownOption, { minHeight: 42, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: currentHazard.hazardCategory === category ? "rgba(249,115,22,0.12)" : "#FFFFFF" }]}
                      onPress={() => { updateHazard({ hazardCategory: category }); setCategoryOpen(false); }}
                    >
                      <Text style={[styles.dropdownOptionText, { color: "#101828", fontSize: 14 }]}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}`;

content = content.replace(dropdownOpenBlock, replacement);
fs.writeFileSync('frontend/app/tabs/camera.tsx', content);
