Tai Kilpatrick - V00943861

Here is the list of all elements in my Assignment 1
    
1. You have to use real-time to synchronize your animations. (2 Marks).
    All movement is using either timestamp or dt to synchronize the timing.

2.Ground box, 2 (Marks).
    Ground box is implemented in lines 421-433

3. Two rocks (spheres), (4 Marks).
    The rocks are implemented from lines 318-336, where the larger rock is the origin of the WCS
4. Seaweed modelling: each strand has 10 ellipses. (4 Marks).
    The seaweed is modeled and animated from lines 357-371, and within the function renderSeaweedStrand(),
    each seaweed has 10 strands and has a rotation throughout the whole body along with a sine wave 
    throughout the length of the seaweed
5. Seaweed animation (4 Marks).
    Complete - Mentioned above
6. Seaweed positioning (3 strands) (3 Marks).
    Complete - Mentioned above

7. Fish modelling: 2 eyes with pupils, 1 head, 1 body, 2 tail fins, (6 Marks).
    Completed - function renderFish() lines 440 - 540
8. Fish animation: The fish must swim in a circle around the seaweed. It should always be aligned with the tangent of the circle. (4 Marks).
    Completed - Implemented in renderFIsh() function at lines 443-447 - the fish is rotated around the seaweed, and also swims up and down from 0<y<1

9. Model a human character with no arms. (4 Marks).
    Completed - Lines 374 - 400 and renderDiverLeg function
10. The character should move in the x and y world directions. (2 Marks).
    Completed - Lines 378-379
11. The legs of the character should kick (hips and knees rotate) as shown in the video. Note that the feet do not move. (4 Marks).
    Completed - renderDiverLeg() lines 598 - 620

12. The bubbles randomly spawn in groups from where the human character's mouth would be and float upward. Note that the bubbles are not "attached" to the human, their motion is independent of the motion of anything else in the scene. (2 Marks).
    Completed (partially) - The bubble spawn and float upwards, and after a random time,
    they will return to the divers mouth as new bubbles, the bubbles spawn occasionally over one another, but over time are seperated.

13. You do not have to match the exact motion or dimensions of the objects shown in the examples. However, your scene should fit in the window (see 14) and be qualitatively and visually similar to the sample (4 Marks).
    Complete
14. Programming style (comments, functions) (2 Marks).
    Complete
15. The scene should be 512x512. (-2 Marks if it is not).
    Complete

16. You have to submit a SINGLE file called <firstname-lastname>.zip that includes all the necessary files. (-2 Marks if you do not). 
    Complete

17. You have to include a readme.txt file that describes in full detail which of the required elements you have implemented successfully and which ones you have not. (-4 Marks if you do not).
    Complete
