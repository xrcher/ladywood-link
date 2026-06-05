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
    
        )
    }
}