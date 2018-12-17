import React from 'react'
import {
  AragonApp,
  Button,
  Card,
  Text,
  TextInput,
  RadioList,
  Field,
  AppBar,
  AppView,
  SidePanel,
  observe,
  EmptyStateCard,
  NavigationBar,
} from '@aragon/ui'
import Aragon, { providers } from '@aragon/client'
import styled from 'styled-components'

import OrganismScreen from './screens/Organism'

import emptyIcon from './assets/empty-card.svg'

const EmptyIcon = <img src={emptyIcon} alt="" />

const EmptyContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
`

const ItemContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(282px, 1fr));
  grid-gap: 2rem;
`

const items = [
  {
    title: 'Dictator',
    description: 'Maintainers-based governance à-la GitHub',
    value: 'dictator',
  },
  {
    title: 'Democracy',
    description: 'Lineage-based voting, DAO-style',
    value: 'democracy',
  },
]

export default class App extends React.Component {
  state = {
    panelOpen: false,
    selectedScheme: 0,
    organismName: '',
    organismToken: '',
    organisms: [],
    navItems: ["Pando's Colony"],
  }

  forward = (organismName, organismIndex) => {
    this.setState(({ navItems }) => ({
      navItems: [...navItems, organismName],
      selectedOrganism: organismIndex,
    }))
  }

  backward = () => {
    if (this.state.navItems.length <= 1) {
      return
    }
    this.setState(({ navItems }) => ({ navItems: navItems.slice(0, -1) }))
  }

  toggleSidebar = () => {
    this.setState({
      panelOpen: !this.state.panelOpen,
      selectedScheme: 0,
      organismName: '',
      organismToken: '',
      selectedOrganism: 0,
    })
  }

  addOrganism = () => {
    let { organisms, selectedScheme, organismName, organismToken } = this.state

    if (!organismName || !organismToken) {
      alert('Please make sure to fill out everything')
      return
    }

    const length = organisms.push({
      name: organismName,
      token: organismToken.toUpperCase(),
      scheme: selectedScheme,
      deployed: false,
    })

    setTimeout(() => {
      let test = this.state.organisms
      test[length - 1].deployed = true
      this.setState({ organisms: test })
    }, 5000)

    this.setState({ organisms })
    this.toggleSidebar()
  }

  render() {
    const {
      organisms,
      organismName,
      organismToken,
      selectedScheme,
      panelOpen,
      navItems,
      selectedOrganism,
    } = this.state

    let renderOrganisms

    if (organisms.length) {
      renderOrganisms = organisms.map(({ name, token, deployed }, idx) => (
        <EmptyStateCard
          key={idx}
          icon={EmptyIcon}
          title={name}
          text={'Token: ' + token}
          actionText={deployed ? 'View organism' : 'Deploying...'}
          onActivate={() => deployed && this.forward(name, idx)}
        />
      ))
    }

    return (
      <AragonApp publicUrl="/">
        <AppView
          appBar={
            <AppBar
              endContent={
                navItems.length < 2 && (
                  <Button mode="strong" onClick={this.toggleSidebar}>
                    New organism
                  </Button>
                )
              }
            >
              <NavigationBar items={navItems} onBack={this.backward} />
            </AppBar>
          }
        >
          {navItems.length < 2 && !this.state.organisms.length && (
            <EmptyContainer>
              <EmptyStateCard
                icon={EmptyIcon}
                title="Deploy an organism"
                text="Get started now by deploying a new organism"
                actionText="New organism"
                onActivate={this.toggleSidebar}
              />
            </EmptyContainer>
          )}
          {navItems.length < 2 && !!organisms.length && (
            <ItemContainer>{renderOrganisms}</ItemContainer>
          )}
          {navItems.length > 1 && (
            <OrganismScreen name={organisms[selectedOrganism].name} />
          )}
          <SidePanel title="Menu" opened={panelOpen}>
            <div style={{ marginTop: '1rem' }}>
              <Text size="xlarge">Deploy organism</Text>
            </div>
            <Field label="Name:">
              <TextInput
                wide
                value={organismName}
                onChange={e => this.setState({ organismName: e.target.value })}
              />
            </Field>
            <Field label="Token:">
              <TextInput
                wide
                value={organismToken}
                onChange={e => this.setState({ organismToken: e.target.value })}
              />
            </Field>
            <RadioList
              title="Governance scheme"
              description="You have two options:"
              items={items}
              selected={selectedScheme}
              onSelect={selected => this.setState({ selectedScheme: selected })}
            />
            <Button
              style={{ marginTop: '1.5rem' }}
              mode="strong"
              onClick={this.addOrganism}
            >
              Deploy organism
            </Button>
          </SidePanel>
        </AppView>
      </AragonApp>
    )
  }
}

const ObservedCount = observe(state$ => state$, { count: 0 })(({ count }) => (
  <Text.Block style={{ textAlign: 'center' }} size="xxlarge">
    {count}
  </Text.Block>
))
