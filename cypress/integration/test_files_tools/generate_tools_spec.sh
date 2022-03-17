rm *.js
for i in {1..36}
do
echo "$(cat gen_tools_part_1.txt)" >> "tools_test_spec_$i.js"
echo "    let start = $((i-1));" >> "tools_test_spec_$i.js"
echo "    let n = 1;" >> "tools_test_spec_$i.js"
echo "    let end = start+n;" >> "tools_test_spec_$i.js"
echo "    let out_path = 'data/tools_out_' + $i + '.json';" >> "tools_test_spec_$i.js"
echo "$(cat gen_tools_part_2.txt)" >> "tools_test_spec_$i.js"
done