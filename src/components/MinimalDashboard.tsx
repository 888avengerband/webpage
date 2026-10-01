@@
   // Military rank weight order: Officers -> Senior NCOs -> Junior NCOs -> Cadets
   const RANK_ORDER: Record<string, number> = {
-    'Maj': 100,
-    'Capt': 90,
-    'Lt': 80,
-    '2Lt': 70,
-    'OCdt': 60,
-    'Officer': 55,
-    'CI': 50,
-    'CV': 45,
-    'WO1': 40,
-    'WO2': 35,
-    'FSgt': 30,
-    'Sgt': 25,
-    'FCpl': 20,
-    'Cpl': 15,
-    'LAC': 10,
-    'Cdt': 5,
+    'Maj': 100,
+    'Capt': 90,
+    'Lt': 80,
+    '2Lt': 70,
+    'OCdt': 60,
+    // Civilian Instructor and Civilian Volunteer placed above WO1
+    'CI': 55,
+    'CV': 50,
+    'WO1': 45,
+    'WO2': 40,
+    'FSgt': 35,
+    'Sgt': 30,
+    'FCpl': 25,
+    'Cpl': 20,
+    'LAC': 15,
+    'Cdt': 10,
   };
@@
-              <button
-                type="submit"
-                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-sm"
-              >
-                Change Admin Profile
-              </button>
+              <button
+                type="submit"
+                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-sm"
+              >
+                Save Profile
+              </button>
