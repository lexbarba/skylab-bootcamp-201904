import React, { Component } from 'react'
import literals from './literals'
import logic from '../../logic'
import Results from '../Results'
import Detail from '../Detail'
import User from '../User'
import Favorites from '../Favorites'
import './index.sass'
import SmallCard from '../SmallCard';
import { logicalExpression } from '@babel/types';


class Home extends Component {

    state = { error: null, recipes: null, recipe: null, wanted: null, done: null, notes: null, forks: null, fullDone: null, fullWanted: null, user: null }

    handleGoBack = () => this.setState({ recipe: null })

    handleRetrieve = id => {
        logic.retrieveRecipe(id)
            .then((recipe) => {
                this.setState({ recipe: recipe })
            })
            .catch(error =>
                this.setState({ error: error.message })
            )
    }

    handleWaitingList = (id, done) => {
        try {
            logic.updateBook(id, done)
                .then(() =>
                    logic.retrieveBook()
                )
                .then(([wanted, done, notes, forks, fullWanted, fullDone ]) => {
                    this.setState({ wanted, done, notes, forks, fullWanted, fullDone})
                })
                .catch(error =>
                    this.setState({ error: error.message })
                )
        } catch ({ message }) {
            console.error(message)
        }
    }

    handleNotes = (id, changes, notes) => {
        logic.updatingNotes(id, changes, notes)
            .then(() => logic.retrieveBook())
            .then(([wanted, done, notes,forks, fullWanted, fullDone]) => {
                this.setState({ wanted, done, notes, forks, fullWanted, fullDone})
            })
    }


    handleRandom = () => {

        let random = { meals: [] }

        Promise.all([logic.retrieveRandomRecipes(),
        logic.retrieveRandomRecipes(),
        logic.retrieveRandomRecipes(),
        logic.retrieveRandomRecipes(),
        logic.retrieveRandomRecipes(),
        logic.retrieveRandomRecipes(),
        logic.retrieveRandomRecipes(),
        logic.retrieveRandomRecipes()])
            .then(response => {
                random.meals = response.map(_meal => {
                    const { meals } = _meal
                    return meals[0]
                })

                this.setState({ recipe: null, recipes: random })
            })

    }


    handleRetriveBook = () => {
        logic.retrieveBook()
            .then(([wanted, done, notes, forks, fullWanted, fullDone]) => {
                this.setState({ wanted, done, notes, forks, fullWanted, fullDone })
            })

    }

    handleUser = () => { // nuevo
        logic.retrieveUser()
            .then(response => {
                // const {name,surname,email} = response
                this.setState({ user: response })
            })
    }

    handleUpdateUser = (xxx) => { // nuevo

        if (!xxx) {
            this.setState({ user: null })
        } else {
            logic.updateUser(xxx)
                .then(response => {
                    if (response.status === 'OK') this.setState({ user: null })
                    else throw Error(response.error)
                })
        }
    }

    componentWillReceiveProps(props) {
        const { results } = props
        if (results !== null) {
            this.setState({ recipes: results, recipe: null });
        }
    }

    componentDidMount() {
        this.handleRetriveBook()
        this.handleRandom()
    }

    render() {
        const {
            handleRandom,
            handleGoBack,
            handleNewSearch,
            handleUpdateUser,
            handleNotes,
            //handleForks,
            handleWaitingList,
            handleUser,
            handleRetrieve,
            state: { error, recipe, recipes, wanted, done, notes, forks, user, fullWanted, fullDone},
        } = this

        if (recipes === null && recipe === null) handleRandom()

        return <main className="home">

            <div>
                <nav className="nav">
                    <div className="nav__user">
                        <a className="nav__user-img">
                            <img onClick={() => handleUser()} src="http://www.europe-together.eu/wp-content/themes/sd/images/user-placeholder.svg" />
                        </a>
                        <a>
                            <p className="nav__user-name" >Hola</p>
                        </a>
                    </div>
                    <div className="nav__recipes">
                        <h4>Boiling</h4>
                        <SmallCard toPaint={fullWanted} onItem={handleRetrieve}></SmallCard>
                    </div>
                    <div className="nav__recipes">
                        <h4>My Creations</h4>
                        <SmallCard toPaint={fullDone} onItem={handleRetrieve}></SmallCard>
                    </div>
                </nav>
            </div>
            <div >
                <div className="home__search__results">
                    {!recipe && !user && recipes && <Results items={recipes} onItem={handleRetrieve} /*onFav={handleFav} favs={favs}*/ />}
                    {!user && recipe && <Detail item={recipe} onNotes={handleNotes} onBack={handleGoBack} onWaiting={handleWaitingList} error={error} done={done} wanted={wanted} notes={notes} />}
                    {user && <User onUpdate={handleUpdateUser} onBack={handleUpdateUser} user={user} />}
                </div>
            </div>

        </main>
    }
}
export default Home