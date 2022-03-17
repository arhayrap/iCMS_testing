rm *.js
for i in {1..2}
do
echo "$(cat gen_epr_part_1.txt)" >> "epr_test_spec_$i.js"
echo "    let n = 167;" >> "epr_test_spec_$i.js"
echo "    let start = n * $((i-1));" >> "epr_test_spec_$i.js"
echo "    let end = n * $i;" >> "epr_test_spec_$i.js"
echo "    let out_path = 'data/epr_out_' + $i + '.json';" >> "epr_test_spec_$i.js"
echo "$(cat gen_epr_part_2.txt)" >> "epr_test_spec_$i.js"
done