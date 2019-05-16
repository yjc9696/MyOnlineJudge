g++ src.cpp -g -o evaluation9
evaluation9
fc src.out std.out
echo Correct>result.txt
if errorlevel==1 echo Wronganswer >result.txt
