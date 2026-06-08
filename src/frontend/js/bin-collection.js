document.addeventListener('DOMContentLoaded', () => {
    const button = document.getElementById('postcodeBtn');
    button.addEventListener('click', async() => {

        const postcode =
        document.getElementById('postcodeInput')
        .value
        .trim()
        .toUpperCase();

    if (!postcode){
        return;
    }

    try{

        const response = await fetch(
            `/api/bin-collection?postcode=${postcode}`
        );

        const data = await response.json();

        document.getElementById(
            'collectionResult'
        ).innerHTML = `

            <div class="card result-card">

                <h2>${data.nextCollection}</h2>

                <p>
                    <strong>Bin Type: </strong>
                    ${data.binType}
                </p>

                <p>
                    <strong>Area:</strong>
                    ${data.area}
                </p>


            </div>
        `;
    } catch (error){

        document.getElementById(
            'collectionResult'
        ).innerHTML = `
            <p>Collection infromation unavailable.</p>
        `;

        console.error(error);
    }
    });
});