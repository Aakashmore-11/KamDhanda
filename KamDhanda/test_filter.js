const projects = [
    { title: "Project 1", status: "Open", category: "Other" },
    { title: "Project 2", status: "Open", category: "Development" },
    { title: "Project 3", status: "Closed", category: "Design" }
];

const selectedCategory = "All";
const searchTerm = "";

const getFilteredData = () => {
    let filtered = projects.filter(p => p.status?.toLowerCase() === "open");

    if (selectedCategory !== "All") {
      filtered = filtered.filter((project) =>
        project.category?.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
      );
    }

    if (searchTerm.trim()) {
      const searchVal = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchVal) ||
          p.description?.toLowerCase().includes(searchVal)
      );
    }
    return filtered;
};

console.log("Filtered Length (All):", getFilteredData().length);

const testDev = () => {
    const cat = "Development";
    let filtered = projects.filter(p => p.status?.toLowerCase() === "open");
    filtered = filtered.filter(p => p.category?.toLowerCase().trim() === cat.toLowerCase().trim());
    return filtered;
}
console.log("Filtered Length (Development):", testDev().length);
