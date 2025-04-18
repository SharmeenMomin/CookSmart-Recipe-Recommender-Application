import { doc, setDoc, deleteDoc, getDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

// Function to bookmark a recipe by name
export const bookmarkRecipe = async (recipe) => {
    const user = auth.currentUser;
    if (user) {
        const documentId = `${user.uid}_${recipe.name}`;
        const bookmarkRef = doc(db, "bookmarks", documentId);
        await setDoc(bookmarkRef, { userId: user.uid, recipeName: recipe.name, ingredients: recipe.ingredients, cookingTime: recipe.time, steps: recipe.process });
    }
};

// Function to unbookmark a recipe by name
export const unbookmarkRecipe = async (recipeName) => {
    const user = auth.currentUser;
    if (user) {
        const documentId = `${user.uid}_${recipeName}`; // Use the same documentId format
        const bookmarkRef = doc(db, "bookmarks", documentId);
        await deleteDoc(bookmarkRef);
    }
};

// Function to check if a recipe is bookmarked
export const isRecipeBookmarked = async (recipeName) => {
    const user = auth.currentUser;
    if (user) {
        const documentId = `${user.uid}_${recipeName}`; // Use the same documentId format
        const bookmarkRef = doc(db, "bookmarks", documentId);
        const bookmarkSnap = await getDoc(bookmarkRef);
        return bookmarkSnap.exists();
    }
    return false; // Return false if user is not logged in
};

// Function to fetch all bookmarked recipes for the current user
export const fetchBookmarkedRecipes = async () => {
    const user = auth.currentUser;
    if (user) {
        try {
            const bookmarksRef = collection(db, "bookmarks");
            const q = query(bookmarksRef, where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);

            // Return all recipes bookmarked by the user
            return querySnapshot.docs.map((doc) => doc.data());
        } catch (error) {
            console.error("Error fetching bookmarked recipes: ", error);
            return [];
        }
    } else {
        console.warn("No user is logged in.");
        return [];
    }
};

// Fetch all ingredients from bookmarked recipes
export const fetchBookmarkedIngredients = async () => {
    const user = auth.currentUser;
    if (user) {
        const bookmarksRef = collection(db, "bookmarks");
        const q = query(bookmarksRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        let allIngredients = [];
        querySnapshot.forEach((doc) => {
            const recipe = doc.data();
            if (recipe.ingredients) {
                allIngredients = [...allIngredients, ...recipe.ingredients];
            }
        });
        
        // Remove duplicates
        return [...new Set(allIngredients)];
    }
    return [];
};